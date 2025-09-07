import { mintUploadUrl, signDownloadUrl, hardDeleteObject } from '../services/s3/mediaService.js';

export const presignUploadHandler = async (req, res) => {
    console.log('presignUploadHandler');
  try {
    const { resource, filename, contentType, cache } = req.body || {};
    if (!resource || !filename || !contentType) {
      return res.status(400).json({ error: 'resource, filename, contentType required' });
    }
    const userId = req?.user?.id || null;
    const out = await mintUploadUrl({ resource, userId, filename, contentType, cache });
    return res.status(200).json({ ...out, method: 'PUT', headers: { 'Content-Type': out.contentType } });
  } catch (e) {
    return res.status(e.status || 500).json({ error: String(e?.message || e) });
  }
};

export const signViewHandler = async (req, res) => {
  try {
    const { key, ttl } = req.query || {};
    if (!key) return res.status(400).json({ error: 'key required' });
    const out = await signDownloadUrl({ key: String(key), ttl: Number(ttl) || 300 });
    return res.status(200).json(out);
  } catch (e) {
    return res.status(e.status || 500).json({ error: String(e?.message || e) });
  }
};

export const deleteMediaHandler = async (req, res) => {
  try {
    const { key } = req.query || {};
    if (!key) return res.status(400).json({ error: 'key required' });
    await hardDeleteObject({ key: String(key) });
    return res.sendStatus(204);
  } catch (e) {
    return res.status(e.status || 500).json({ error: String(e?.message || e) });
  }
};