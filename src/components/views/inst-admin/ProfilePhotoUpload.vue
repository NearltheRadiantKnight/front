<template>
  <div class="simple-photo-upload">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-header-title">系主任照片上传</span>
      </template>
    </el-page-header>

    <el-card class="upload-card">
      <div class="upload-content">
        <!-- 当前照片 -->
        <div class="current-section">
          <h3><i class="el-icon-picture"></i> 当前照片</h3>
          <div class="current-photo-container">
            <div v-if="currentPhoto" class="photo-wrapper">
              <img :src="currentPhoto" alt="当前照片" class="current-photo" />
              <div class="photo-info">
                <p>当前使用照片</p>
                <el-button type="text" size="small" @click="downloadPhoto">
                  <i class="el-icon-download"></i> 下载
                </el-button>
              </div>
            </div>
            <div v-else class="empty-photo">
              <i class="el-icon-user"></i>
              <p>暂无照片</p>
            </div>
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="upload-section">
          <h3><i class="el-icon-upload"></i> 上传新照片</h3>

          <el-upload
            class="uploader"
            drag
            :action="uploadAction"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-error="handleError"
            :show-file-list="false"
            accept="image/*"
          >
            <div class="uploader-content">
              <i class="el-icon-upload"></i>
              <div class="uploader-text">
                <p>将文件拖到此处，或<em>点击上传</em></p>
                <p class="uploader-tip">只能上传jpg/png文件，且不超过2MB</p>
              </div>
            </div>
          </el-upload>

          <div v-if="previewUrl" class="preview-section">
            <h4>预览</h4>
            <img :src="previewUrl" alt="预览" class="preview-image" />
            <div class="preview-actions">
              <el-button type="primary" @click="confirmUpload" size="small">
                <i class="el-icon-check"></i> 确认上传
              </el-button>
              <el-button @click="clearPreview" size="small">
                <i class="el-icon-close"></i> 取消
              </el-button>
            </div>
          </div>

          <!-- 上传指南 -->
          <div class="upload-guide">
            <h4><i class="el-icon-info"></i> 上传指南</h4>
            <ul>
              <li>支持格式：JPG、PNG</li>
              <li>文件大小：不超过 2MB</li>
              <li>建议尺寸：300x300 像素</li>
              <li>照片要求：正面免冠，五官清晰</li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '@/api';

export default defineComponent({
  name: 'SimplePhotoUpload',
  setup() {
    const router = useRouter();

    const currentPhoto = ref('');
    const previewUrl = ref('');
    const uploadAction = ref('/api/profile/upload-photo');

    // 加载当前照片
    const loadCurrentPhoto = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;

        const info = JSON.parse(userInfo);
        const response = await request.get('/api/profile/current-photo', {
          params: {
            user_id: info.id || info.user_id || '',
            institute_id: info.institute_id || info.instId || 1
          }
        });

        if (response.code === 200 && response.data.photo_url) {
          currentPhoto.value = response.data.photo_url;
        }
      } catch (error) {
        console.error('加载照片失败:', error);
      }
    };

    // 上传前验证
    const beforeUpload = (file: File) => {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
        return false;
      }

      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      return true;
    };

    // 上传成功
    const handleSuccess = (response: any) => {
      if (response.code === 200) {
        ElMessage.success('照片上传成功');
        previewUrl.value = '';
        loadCurrentPhoto();
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    };

    // 上传失败
    const handleError = () => {
      ElMessage.error('上传失败');
    };

    // 确认上传（手动触发）
    const confirmUpload = () => {
      // 这里可以添加额外的确认逻辑
      ElMessage.success('照片已上传成功');
      previewUrl.value = '';
      loadCurrentPhoto();
    };

    // 清除预览
    const clearPreview = () => {
      previewUrl.value = '';
    };

    // 下载照片
    const downloadPhoto = () => {
      if (!currentPhoto.value) return;

      const link = document.createElement('a');
      link.href = currentPhoto.value;
      link.download = 'profile-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // 返回
    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      loadCurrentPhoto();
    });

    return {
      currentPhoto,
      previewUrl,
      uploadAction,
      beforeUpload,
      handleSuccess,
      handleError,
      confirmUpload,
      clearPreview,
      downloadPhoto,
      goBack
    };
  }
});
</script>

<style scoped>
.simple-photo-upload {
  padding: 20px;
}

.upload-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.upload-content {
  display: flex;
  gap: 40px;
}

.current-section, .upload-section {
  flex: 1;
}

.current-section h3, .upload-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-photo-container {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
  text-align: center;
}

.photo-wrapper {
  display: inline-block;
}

.current-photo {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-info {
  margin-top: 15px;
}

.photo-info p {
  margin-bottom: 8px;
  color: #666;
}

.empty-photo {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #e4e7ed;
  border-radius: 8px;
  margin: 0 auto;
}

.empty-photo i {
  font-size: 60px;
  color: #909399;
  margin-bottom: 10px;
}

.empty-photo p {
  color: #909399;
}

/* 上传区域 */
.uploader {
  margin-bottom: 20px;
}

.uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.uploader-content {
  padding: 20px;
  text-align: center;
}

.uploader-content i {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 15px;
}

.uploader-text p {
  margin-bottom: 5px;
}

.uploader-tip {
  color: #8c939d;
  font-size: 12px;
  margin-top: 10px;
}

/* 预览区域 */
.preview-section {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #f8f9fa;
}

.preview-section h4 {
  margin-bottom: 15px;
  color: #333;
}

.preview-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 上传指南 */
.upload-guide {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border: 1px solid #c6e2ff;
  border-radius: 8px;
}

.upload-guide h4 {
  margin-bottom: 10px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-guide ul {
  margin-left: 20px;
  color: #666;
}

.upload-guide li {
  margin-bottom: 5px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .upload-content {
    flex-direction: column;
    gap: 30px;
  }

  .current-photo,
  .empty-photo {
    width: 150px;
    height: 150px;
  }
}
</style>