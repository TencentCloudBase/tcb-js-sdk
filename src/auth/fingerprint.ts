import Fingerprint from 'fingerprintjs2';
import { Adapter } from '../adapters';

const TcbFingerprintIdName = 'TcbFingerprintId';

const excludesIdle = ['screenResolution', 'availableScreenResolution', 'plugins'];
const excludesAni = ['screenResolution', 'availableScreenResolution', 'plugins', 'webgl', 'canvas', 'webglVendorAndRenderer'];


const promise = new Promise((resolve) => {

  function genFingerprint(excludes) {
    Fingerprint.get(function (components) {
      components = components.filter(item => {
        return excludes.indexOf(item.key) === -1;
      });
      const values = components.map(function (component) { return component.value });
      const tcbFingerprintId = Fingerprint.x64hash128(values.join(''), 31);
      resolve(tcbFingerprintId);
    });
  }

  if (window && (window as any).requestIdleCallback) {
    (window as any).requestIdleCallback(function () {
      genFingerprint(excludesIdle);
    });
  } else if (window && (window as any).requestAnimationFrame) {
    (window as any).requestAnimationFrame(function () {
      genFingerprint(excludesAni);
    });
  }

  // 500ms取不到值，则返回空值
  setTimeout(() => {
    resolve(null);
  }, 500);
});

promise.then().catch();

export async function getTcbFingerprintId() {
  let storageClass = (Adapter.adapter && Adapter.adapter.localStorage) || null;
  // 以localstorage中的数据为主,防止用户更改浏览器设置，更新了指纹
  let id;
  if (storageClass) {
    id = storageClass.getItem(TcbFingerprintIdName);
  }
  if (id) {
    return id;
  }
  try {
    id = await promise;
    if (id && id.length > 32) {
      id = id.slice(0, 32);
    }
  } catch (e) { }
  let isLocal;
  if (!id) {
    isLocal = true;
    id = Math.random().toString(16).slice(2) + '_' + parseInt(String(Date.now() / 1000), 10);
  }
  if (storageClass) {
    storageClass.setItem(TcbFingerprintIdName, id);
  }
  // 极端情况，不支持localStorage 并且 是本地生成的，则返回null
  if (!storageClass && isLocal) {
    return null;
  }
  return id;
}

