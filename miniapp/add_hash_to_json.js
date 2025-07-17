// Скрипт для добавления hash в каждый объект data во всех JSON-файлах miniapp/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const miniappDir = path.join(__dirname);

function getAllJsonFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(dir, f));
}

function getHash(obj) {
  // Используем name+id, если есть, иначе только name
  const base = (obj.name || '') + (obj.id || '');
  return crypto.createHash('md5').update(base).digest('hex').slice(0, 12);
}

getAllJsonFiles(miniappDir).forEach(file => {
  const raw = fs.readFileSync(file, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('Ошибка парсинга', file, e);
    return;
  }
  if (Array.isArray(json.data)) {
    let changed = false;
    json.data.forEach(obj => {
      if (!obj.hash) {
        obj.hash = getHash(obj);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf8');
      console.log('Обновлён:', file);
    }
  }
}); 