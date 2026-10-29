import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true },
    actorRole: { type: String, default: 'admin' },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
