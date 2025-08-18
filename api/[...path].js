// This file is being replaced by specific endpoint files
export default async function handler(req, res) {
  res.status(404).json({ success: false, message: 'This endpoint is deprecated' });
}
