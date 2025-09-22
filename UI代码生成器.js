// 🎨 UI代码生成器 - 扑克双上计分小程序
// 用于快速生成常用的UI组件代码

class UICodeGenerator {
  constructor() {
    this.templates = {
      button: this.generateButton,
      modal: this.generateModal,
      table: this.generateTable,
      form: this.generateForm,
      card: this.generateCard
    };
  }

  // 🎯 生成按钮组件
  generateButton(options = {}) {
    const {
      text = '按钮',
      type = 'primary',
      size = 'medium',
      disabled = false,
      bindtap = 'onButtonClick',
      className = ''
    } = options;

    return `
<!-- 现代化按钮组件 -->
<button class="modern-btn ${type} ${size} ${className}" 
        bindtap="${bindtap}" 
        disabled="${disabled}">
  <text class="btn-text">${text}</text>
</button>

<style>
.modern-btn {
  border-radius: 12rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modern-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.modern-btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 2rpx solid #ddd;
}

.modern-btn.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
}

.modern-btn.small {
  padding: 16rpx 24rpx;
  font-size: 24rpx;
}

.modern-btn.medium {
  padding: 20rpx 32rpx;
  font-size: 28rpx;
}

.modern-btn.large {
  padding: 24rpx 40rpx;
  font-size: 32rpx;
}

.modern-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
}

.modern-btn[disabled] {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}
</style>
    `;
  }

  // 🎯 生成弹窗组件
  generateModal(options = {}) {
    const {
      title = '标题',
      content = '内容',
      show = 'showModal',
      onClose = 'onCloseModal',
      onConfirm = 'onConfirmModal',
      confirmText = '确认',
      cancelText = '取消'
    } = options;

    return `
<!-- 现代化弹窗组件 -->
<view class="modal-overlay" wx:if="{{${show}}}" bindtap="${onClose}">
  <view class="modal-container" catchtap="stopPropagation">
    <view class="modal-header">
      <text class="modal-title">${title}</text>
      <view class="modal-close" bindtap="${onClose}">
        <text class="close-icon">×</text>
      </view>
    </view>
    
    <view class="modal-content">
      <text class="modal-text">${content}</text>
    </view>
    
    <view class="modal-footer">
      <button class="modal-btn cancel-btn" bindtap="${onClose}">${cancelText}</button>
      <button class="modal-btn confirm-btn" bindtap="${onConfirm}">${confirmText}</button>
    </view>
  </view>
</view>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 16rpx;
  width: 80%;
  max-width: 600rpx;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 32rpx;
  color: #666;
}

.modal-content {
  padding: 32rpx;
}

.modal-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border: none;
  background: none;
  font-size: 28rpx;
  border-radius: 0;
}

.cancel-btn {
  color: #666;
  border-right: 1rpx solid #eee;
}

.confirm-btn {
  color: #667eea;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50rpx); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
    `;
  }

  // 🎯 生成表格组件
  generateTable(options = {}) {
    const {
      headers = ['列1', '列2', '列3'],
      data = 'tableData',
      className = ''
    } = options;

    return `
<!-- 现代化表格组件 -->
<view class="modern-table ${className}">
  <view class="table-header">
    ${headers.map(header => `
      <view class="header-cell">
        <text class="header-text">${header}</text>
      </view>
    `).join('')}
  </view>
  
  <view class="table-body">
    <view class="table-row" wx:for="{{${data}}}" wx:key="index">
      <view class="table-cell" wx:for="{{item}}" wx:key="index">
        <text class="cell-text">{{item}}</text>
      </view>
    </view>
  </view>
</view>

<style>
.modern-table {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.table-header {
  background: #f8f9fa;
  display: flex;
}

.header-cell {
  flex: 1;
  padding: 24rpx 16rpx;
  text-align: center;
  border-right: 1rpx solid #eee;
}

.header-cell:last-child {
  border-right: none;
}

.header-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #eee;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 24rpx 16rpx;
  text-align: center;
  border-right: 1rpx solid #eee;
}

.table-cell:last-child {
  border-right: none;
}

.cell-text {
  font-size: 26rpx;
  color: #666;
}
</style>
    `;
  }

  // 🎯 生成表单组件
  generateForm(options = {}) {
    const {
      fields = [
        { name: 'field1', label: '字段1', type: 'text' },
        { name: 'field2', label: '字段2', type: 'number' }
      ],
      onSubmit = 'onSubmitForm',
      className = ''
    } = options;

    return `
<!-- 现代化表单组件 -->
<view class="modern-form ${className}">
  ${fields.map(field => `
    <view class="form-field">
      <text class="field-label">${field.label}</text>
      <input class="field-input" 
             type="${field.type}" 
             placeholder="请输入${field.label}"
             value="{{formData.${field.name}}}"
             bindinput="onFieldInput"
             data-field="${field.name}" />
    </view>
  `).join('')}
  
  <button class="form-submit" bindtap="${onSubmit}">提交</button>
</view>

<style>
.modern-form {
  background: white;
  padding: 32rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.form-field {
  margin-bottom: 32rpx;
}

.field-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.field-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #fafafa;
  transition: all 0.3s ease;
}

.field-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.form-submit {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 32rpx;
}
</style>
    `;
  }

  // 🎯 生成卡片组件
  generateCard(options = {}) {
    const {
      title = '卡片标题',
      content = '卡片内容',
      actions = [],
      className = ''
    } = options;

    return `
<!-- 现代化卡片组件 -->
<view class="modern-card ${className}">
  <view class="card-header">
    <text class="card-title">${title}</text>
  </view>
  
  <view class="card-content">
    <text class="card-text">${content}</text>
  </view>
  
  ${actions.length > 0 ? `
    <view class="card-actions">
      ${actions.map(action => `
        <button class="card-action" bindtap="${action.bindtap}">
          <text class="action-text">${action.text}</text>
        </button>
      `).join('')}
    </view>
  ` : ''}
</view>

<style>
.modern-card {
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.modern-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
}

.card-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.card-content {
  padding: 32rpx;
}

.card-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.card-actions {
  display: flex;
  border-top: 1rpx solid #eee;
}

.card-action {
  flex: 1;
  padding: 24rpx;
  border: none;
  background: none;
  font-size: 28rpx;
  color: #667eea;
  border-right: 1rpx solid #eee;
}

.card-action:last-child {
  border-right: none;
}

.action-text {
  font-weight: 500;
}
</style>
    `;
  }

  // 🎯 生成完整页面模板
  generatePage(options = {}) {
    const {
      title = '页面标题',
      components = [],
      className = ''
    } = options;

    return `
<!-- 页面模板 -->
<view class="page-container ${className}">
  <view class="page-header">
    <text class="page-title">${title}</text>
  </view>
  
  <view class="page-content">
    ${components.join('\n')}
  </view>
</view>

<style>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: white;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.page-content {
  padding: 32rpx;
}
</style>
    `;
  }
}

// 🎯 使用示例
const generator = new UICodeGenerator();

// 生成按钮
console.log('按钮组件:', generator.generateButton({
  text: '开始游戏',
  type: 'primary',
  size: 'large',
  bindtap: 'onStartGame'
}));

// 生成弹窗
console.log('弹窗组件:', generator.generateModal({
  title: '确认操作',
  content: '确定要开始新游戏吗？',
  onConfirm: 'onConfirmStart',
  onClose: 'onCloseModal'
}));

// 生成表格
console.log('表格组件:', generator.generateTable({
  headers: ['把数', '红方', '蓝方'],
  data: 'historyScores'
}));

// 导出生成器
module.exports = UICodeGenerator;


