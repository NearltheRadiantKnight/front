<template>
  <el-dialog
      v-model="visible"
      title="打包已评分成绩表"
      width="500px"
      :close-on-click-modal="false"
  >
    <div class="export-content">
      <div class="export-info">
        <p>将打包导出 <strong>{{ scoredStudentsCount }}</strong> 份已评分学生的成绩表。</p>
        <p>导出格式：<el-tag type="success" size="small">Word文档</el-tag></p>
        <p>包含内容：<el-tag type="info" size="small">成绩数据</el-tag> <el-tag type="info" size="small">签名栏</el-tag></p>
        <p>打包方式：<el-tag type="warning" size="small">ZIP压缩包</el-tag></p>
      </div>

      <el-divider />

      <div class="export-form">
        <el-form :model="exportForm" label-width="100px">
          <el-form-item label="文件命名">
            <el-input
                v-model="exportForm.filename"
                placeholder="请输入压缩包文件名"
                size="small"
                @keyup.enter="handleConfirm"
            >
              <template #append>
                <span class="file-extension">.zip</span>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="export-preview">
        <h4>导出预览：</h4>
        <div class="preview-content">
          <p>将生成包含 {{ scoredStudentsCount }} 个Word文件的ZIP压缩包：</p>
          <ul>
            <li v-if="groupId">答辩组：{{ groupId }}</li>
            <li>导出时间：{{ currentTime }}</li>
            <li>文件名：{{ exportForm.filename || '未命名' }}.zip</li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="exporting">
          {{ exporting ? '打包中...' : '开始打包' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'ExportDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    scoredStudentsCount: {
      type: Number,
      default: 0
    },
    groupId: {
      type: String,
      default: ''
    }
  },

  emits: ['update:visible', 'confirm', 'cancel'],

  setup(props, { emit }) {
    const exporting = ref(false);
    const currentTime = ref('');

    // 生成当前时间
    const generateCurrentTime = () => {
      const now = new Date();
      return now.toLocaleString('zh-CN');
    };

    // 导出表单
    const exportForm = ref({
      filename: ''
    });

    // 自动生成文件名
    const generateFilename = () => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日`;
      const groupStr = props.groupId ? `_${props.groupId}组` : '';
      exportForm.value.filename = `已评分成绩表${groupStr}_${dateStr}`;
    };

    // 初始化
    const initialize = () => {
      currentTime.value = generateCurrentTime();
      generateFilename();
    };

    // 处理确认
    const handleConfirm = async () => {
      if (!exportForm.value.filename.trim()) {
        ElMessage.warning('请输入文件名');
        return;
      }

      exporting.value = true;

      try {
        // 模拟打包过程
        await new Promise(resolve => setTimeout(resolve, 1500));

        emit('confirm', exportForm.value.filename);
        emit('update:visible', false);

      } catch (error) {
        ElMessage.error('导出失败');
      } finally {
        exporting.value = false;
      }
    };

    // 处理取消
    const handleCancel = () => {
      emit('cancel');
      emit('update:visible', false);
    };

    // 每次打开对话框时初始化
    const handleOpen = () => {
      if (props.visible) {
        initialize();
      }
    };

    return {
      exporting,
      currentTime,
      exportForm,
      handleConfirm,
      handleCancel,
      handleOpen
    };
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        this.initialize();
      }
    }
  }
});
</script>

<style scoped>
.export-content {
  padding: 10px 0;
}

.export-info {
  padding: 10px 0;
}

.export-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.export-info strong {
  color: #409EFF;
  font-size: 16px;
}

.export-form {
  margin: 20px 0;
}

.export-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.export-preview h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.preview-content {
  font-size: 13px;
  color: #606266;
}

.preview-content p {
  margin: 5px 0;
}

.preview-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.preview-content li {
  margin: 5px 0;
  line-height: 1.5;
}

.file-extension {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>