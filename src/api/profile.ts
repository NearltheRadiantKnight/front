import request from './index';

export default {
  // 获取当前照片
  getCurrentPhoto(params: {
    user_id: string;
    institute_id: number;
  }) {
    return request.get('/api/profile/current-photo', { params });
  },

  // 上传照片
  uploadPhoto(data: FormData) {
    return request.post('/api/profile/upload-photo', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取历史照片
  getPhotoHistory(params: {
    user_id: string;
    institute_id: number;
  }) {
    return request.get('/api/profile/photo-history', { params });
  },

  // 恢复照片
  restorePhoto(data: {
    photo_id: string;
    user_id: string;
    institute_id: number;
  }) {
    return request.post('/api/profile/restore-photo', data);
  },

  // 删除历史照片
  deletePhoto(photoId: string) {
    return request.delete(`/api/profile/delete-photo/${photoId}`);
  }
};