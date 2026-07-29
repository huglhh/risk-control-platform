import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 数据文件路径（支持持久化卷：设置 DATA_DIR 环境变量指向挂载目录）
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// 数据字段定义（与前端 Excel 模板完全一致）
const DATA_FIELDS = [
  'f_period', 'f_dimension', 'f_project', 'f_area',
  'f_scar', 'f_q1', 'f_q2', 'f_q3', 'f_q4',
  'f_net1', 'f_net2', 'f_ro', 'f_rfc',
  'f_ehs1', 'f_ehs2', 'f_ehs3',
  'f_h1', 'f_h2', 'f_h3',
  'f_highwork', 'f_p_total', 'f_p_valid', 'f_spec_total', 'f_spec_valid',
  'f_car1', 'f_car2', 'f_car3', 'f_car_work'
];

// 读取数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('读取数据失败:', e.message);
  }
  return [];
}

// 写入数据
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('写入数据失败:', e.message);
    return false;
  }
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 规范化数据行（确保所有字段存在且为数字）
function normalizeRow(row) {
  const normalized = {};
  for (const field of DATA_FIELDS) {
    if (field === 'f_period' || field === 'f_dimension' || field === 'f_project' || field === 'f_area') {
      normalized[field] = String(row[field] || '').trim();
    } else {
      normalized[field] = Number(row[field]) || 0;
    }
  }
  return normalized;
}

// ==================== API 路由 ====================

// 获取全部数据
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json({ success: true, data });
});

// 新增单条数据
app.post('/api/data', (req, res) => {
  const data = readData();
  const newRow = normalizeRow(req.body);
  newRow.id = genId();

  // 查重：同一周期+维度+项目+区域
  const repeatIdx = data.findIndex(d =>
    d.f_period === newRow.f_period &&
    d.f_dimension === newRow.f_dimension &&
    d.f_project === newRow.f_project &&
    d.f_area === newRow.f_area
  );

  if (repeatIdx > -1) {
    data[repeatIdx] = newRow;
  } else {
    data.push(newRow);
  }

  writeData(data);
  res.json({ success: true, data: newRow, message: repeatIdx > -1 ? '已覆盖重复数据' : '新增成功' });
});

// 更新单条数据
app.put('/api/data/:id', (req, res) => {
  const data = readData();
  const idx = data.findIndex(d => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: '数据不存在' });
  }
  const updatedRow = normalizeRow(req.body);
  updatedRow.id = req.params.id;
  data[idx] = updatedRow;
  writeData(data);
  res.json({ success: true, data: updatedRow });
});

// 批量导入（必须在 :id 路由之前）
app.post('/api/data/batch', (req, res) => {
  const data = readData();
  const rows = req.body.rows || [];
  let success = 0, fail = 0;
  const errors = [];

  rows.forEach((row, i) => {
    const line = i + 2;
    if (!row.f_period || !row.f_area) {
      fail++;
      errors.push(`第${line}行：周期/区域为空`);
      return;
    }
    const normalized = normalizeRow(row);
    normalized.id = genId();

    const repeatIdx = data.findIndex(d =>
      d.f_period === normalized.f_period &&
      d.f_dimension === normalized.f_dimension &&
      d.f_project === normalized.f_project &&
      d.f_area === normalized.f_area
    );

    if (repeatIdx > -1) {
      data[repeatIdx] = normalized;
      success++;
    } else {
      data.push(normalized);
      success++;
    }
  });

  writeData(data);
  res.json({ success: true, successCount: success, failCount: fail, errors });
});

// 批量删除（必须在 :id 路由之前）
app.delete('/api/data/batch', (req, res) => {
  const data = readData();
  const ids = req.body.ids || [];
  const idSet = new Set(ids);
  const newData = data.filter(d => !idSet.has(d.id));
  const deletedCount = data.length - newData.length;
  writeData(newData);
  res.json({ success: true, deletedCount });
});

// 删除单条数据
app.delete('/api/data/:id', (req, res) => {
  const data = readData();
  const idx = data.findIndex(d => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: '数据不存在' });
  }
  data.splice(idx, 1);
  writeData(data);
  res.json({ success: true, message: '删除成功' });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务正常运行', time: new Date().toISOString() });
});

// 所有其他路由返回 index.html（SPA 支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  项目安全生产风险管控平台 - 服务已启动`);
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  API:  http://localhost:${PORT}/api/data`);
  console.log(`========================================\n`);
});
