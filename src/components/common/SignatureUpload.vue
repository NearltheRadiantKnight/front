<template>
  <div class="simple-photo-upload">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-header-title">签名照管理</span>
      </template>
    </el-page-header>

    <el-card class="upload-card">
      <div class="upload-content">
        <!-- 当前签名照 -->
        <div class="current-section">
          <h3><i class="el-icon-edit"></i> 当前签名</h3>
          <div class="current-photo-container">
            <div v-if="currentSignature" class="photo-wrapper">
              <img :src="getFullImageUrl(currentSignature)" alt="当前签名" class="current-photo" />
              <div class="photo-info">
                <p>当前使用签名</p>
                <div class="photo-actions">
                  <el-button type="text" size="small" @click="downloadSignature">
                    <i class="el-icon-download"></i> 下载
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-photo">
              <i class="el-icon-edit"></i>
              <p>暂无签名</p>
            </div>
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="upload-section">
          <h3><i class="el-icon-upload"></i> 上传新签名</h3>

          <el-upload
              class="uploader"
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept="image/*"
              :before-upload="beforeUpload"
          >
            <div class="uploader-content">
              <i class="el-icon-upload"></i>
              <div class="uploader-text">
                <p>将文件拖到此处，或<em>点击上传</em></p>
                <p class="uploader-tip">支持格式：{{ allowedExtensions.join(', ') }}，且不超过3MB</p>
              </div>
            </div>
          </el-upload>

          <div v-if="previewUrl" class="preview-section">
            <h4>预览</h4>
            <img :src="previewUrl" alt="预览" class="preview-image" />
            <div class="preview-actions">
              <el-button
                  type="primary"
                  @click="confirmUpload"
                  size="small"
                  :loading="uploading"
              >
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
              <li>文件大小：不超过 3MB</li>
              <li>建议尺寸：300x150 像素（适合签名比例）</li>
              <li>内容要求：清晰的手写签名或电子签名</li>
              <li>背景建议：透明背景或白色背景</li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userApi } from '@/api/user.ts';

export default defineComponent({
  name: 'SimplePhotoUpload',
  setup() {
    const router = useRouter();

    // 状态
    const currentSignature = ref('');
    const previewUrl = ref('');
    const selectedFile = ref<File | null>(null);
    const uploading = ref(false);

    // 获取当前用户ID
    const currentUserId = computed(() => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return null;

      try {
        const info = JSON.parse(userInfo);
        return info.id;
      } catch (error) {
        console.error('解析用户信息失败:', error);
        return null;
      }
    });

    // 允许的文件类型 - 与后端配置保持一致
    const allowedExtensions = ['jpg', 'png'];

    // 构建完整的图片URL
    const getFullImageUrl = (relativePath: string) => {
      if (!relativePath) return '';

      console.log('构建图片URL，相对路径:', relativePath);

      // 如果已经是完整URL，直接返回
      if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
      }

      // 获取基础URL
      const baseUrl = window.location.origin;
      console.log('基础URL:', baseUrl);

      // 处理相对路径
      let cleanPath = relativePath;

      // 确保路径以 / 开头
      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
      }

      // 构建完整URL
      const fullUrl = baseUrl + cleanPath;
      console.log('完整图片URL:', fullUrl);

      return fullUrl;
    };

    // 加载当前签名 - 使用统一的API调用
    const loadCurrentSignature = async () => {
      try {
        const userId = currentUserId.value;
        if (!userId) {
          currentSignature.value = '';
          return;
        }

        // 使用统一的API调用
        const result = await userApi.getCurrentSignature(userId);

        if (result.code === 200) {
          if (result.data) {
            currentSignature.value = result.data;
            console.log('获取到签名路径:', result.data);
          } else {
            currentSignature.value = '';
            console.log('用户未上传签名');
          }
        } else {
          ElMessage.error(result.message || '获取签名失败');
          currentSignature.value = '';
        }
      } catch (error: any) {
        console.error('加载签名失败:', error);
        ElMessage.error('加载签名失败: ' + (error.message || error));
        currentSignature.value = '';
      }
    };

    // 文件选择处理
    const handleFileChange = (file: any) => {
      selectedFile.value = file.raw;

      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl.value = e.target?.result as string;
      };
      reader.readAsDataURL(file.raw);
    };

    // 上传前验证 - 修正文件大小限制为3MB
    const beforeUpload = (file: File) => {
      const isImage = file.type.startsWith('image/');
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidExtension = allowedExtensions.includes(fileExtension);
      const isLt3M = file.size / 1024 / 1024 < 3; // 修改为3MB

      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
      }
      if (!isValidExtension) {
        ElMessage.error(`文件类型不支持，仅支持：${allowedExtensions.join(', ')}`);
        return false;
      }
      if (!isLt3M) {
        ElMessage.error('图片大小不能超过 3MB!'); // 修改错误提示
        return false;
      }

      return false; // 返回false，手动上传
    };

    // 确认上传 - 使用统一的API调用
    const confirmUpload = async () => {
      if (!selectedFile.value) {
        ElMessage.warning('请先选择文件');
        return;
      }

      const userId = currentUserId.value;
      if (!userId) {
        ElMessage.warning('无法获取用户ID，请重新登录');
        return;
      }

      uploading.value = true;

      try {
        console.log('上传文件:', selectedFile.value.name);
        console.log('用户ID:', userId);

        // 使用统一的API调用
        const result = await userApi.uploadSignature(selectedFile.value, userId);
        console.log('上传响应结果:', result);

        if (result.code === 200) {
          ElMessage.success('签名上传成功');
          previewUrl.value = '';
          selectedFile.value = null;
          await loadCurrentSignature(); // 重新加载签名
        } else {
          ElMessage.error(result.message || '上传失败');
        }
      } catch (error: any) {
        console.error('上传失败:', error);
        // 更友好的错误提示
        let errorMessage = '上传失败';
        if (error.response) {
          errorMessage = error.response.data?.message || error.response.statusText;
        } else if (error.message) {
          errorMessage = error.message;
        }
        ElMessage.error(errorMessage);
      } finally {
        uploading.value = false;
      }
    };

    // 清除预览
    const clearPreview = () => {
      previewUrl.value = '';
      selectedFile.value = null;
    };

    // 下载签名
    const downloadSignature = () => {
      if (!currentSignature.value) {
        ElMessage.warning('没有可下载的签名');
        return;
      }

      const fullUrl = getFullImageUrl(currentSignature.value);
      console.log('下载URL:', fullUrl);

      // 创建一个隐藏的iframe来测试图片访问
      const testIframe = document.createElement('iframe');
      testIframe.style.display = 'none';
      testIframe.src = fullUrl;
      testIframe.onload = () => {
        console.log('图片可以访问，开始下载');

        // 使用fetch下载图片
        fetch(fullUrl)
            .then(response => response.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `signature_${currentUserId.value || 'user'}_${Date.now()}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              ElMessage.success('下载开始');
            })
            .catch(error => {
              console.error('下载失败:', error);
              ElMessage.error('下载失败: ' + error.message);
            })
            .finally(() => {
              document.body.removeChild(testIframe);
            });
      };
      testIframe.onerror = () => {
        console.error('图片无法访问');
        ElMessage.error('图片无法访问，请检查服务器配置');
        document.body.removeChild(testIframe);
      };

      document.body.appendChild(testIframe);
    };

    // 返回
    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      loadCurrentSignature();
    });

    return {
      currentSignature,
      previewUrl,
      uploading,
      allowedExtensions,
      getFullImageUrl,
      handleFileChange,
      beforeUpload,
      confirmUpload,
      clearPreview,
      downloadSignature,
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
  width: 300px;
  height: 150px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px dashed #dcdfe6;
  background: white;
  padding: 10px;
}

.photo-info {
  margin-top: 15px;
}

.photo-info p {
  margin-bottom: 8px;
  color: #666;
}

.empty-photo {
  width: 300px;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #e4e7ed;
  border-radius: 8px;
  margin: 0 auto;
  border: 1px dashed #dcdfe6;
}

.empty-photo i {
  font-size: 48px;
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
  width: 300px;
  height: 150px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px dashed #dcdfe6;
  background: white;
  padding: 10px;
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
  .empty-photo,
  .preview-image {
    width: 100%;
    max-width: 300px;
    height: 150px;
  }
}
</style>
[file content end]
