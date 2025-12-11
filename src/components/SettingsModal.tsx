import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Webhook, Check, AlertCircle, Send } from 'lucide-react';
import { useWorkspaces, useUpdateWorkspace } from '../hooks/useWorkspaces';
import { useWorkspaceWebhook, useSaveWebhook, useDeleteWebhook, useTestWebhook } from '../hooks/useWebhooks';
import { WEBHOOK_EVENTS, type WebhookEvent } from '../db/schema';

type Tab = 'general' | 'webhooks';

const EVENT_LABELS: Record<WebhookEvent, string> = {
  'issue.created': 'Issue Created',
  'issue.updated': 'Issue Updated',
  'issue.deleted': 'Issue Deleted',
  'project.created': 'Project Created',
  'project.updated': 'Project Updated',
  'project.deleted': 'Project Deleted',
};

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data: workspaces = [] } = useWorkspaces();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspace = workspaces[0];

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // General settings state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Webhook state
  const { data: webhookConfig, isLoading: isLoadingWebhook } = useWorkspaceWebhook(workspace?.id || null);
  const saveWebhookMutation = useSaveWebhook();
  const deleteWebhookMutation = useDeleteWebhook();
  const testWebhookMutation = useTestWebhook();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Initialize form when workspace loads
  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setIcon(workspace.icon || null);
    }
  }, [workspace]);

  // Initialize webhook form when config loads
  useEffect(() => {
    if (webhookConfig) {
      setWebhookUrl(webhookConfig.url);
      setWebhookSecret(webhookConfig.secret || '');
      setWebhookEnabled(webhookConfig.enabled);
      setWebhookEvents(webhookConfig.events as WebhookEvent[]);
    } else if (!isLoadingWebhook) {
      // Reset to defaults if no config
      setWebhookUrl('');
      setWebhookSecret('');
      setWebhookEnabled(true);
      setWebhookEvents([]);
    }
  }, [webhookConfig, isLoadingWebhook]);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIcon(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveGeneral = () => {
    if (name.trim() && workspace) {
      updateWorkspaceMutation.mutate(
        {
          workspaceId: workspace.id,
          name: name.trim(),
          icon,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const handleRemoveIcon = () => {
    setIcon(null);
  };

  const handleEventToggle = (event: WebhookEvent) => {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSaveWebhook = () => {
    if (workspace && webhookUrl && webhookEvents.length > 0) {
      saveWebhookMutation.mutate(
        {
          workspaceId: workspace.id,
          url: webhookUrl,
          secret: webhookSecret || undefined,
          enabled: webhookEnabled,
          events: webhookEvents,
        },
        {
          onSuccess: () => {
            setTestResult(null);
          },
        }
      );
    }
  };

  const handleDeleteWebhook = () => {
    if (workspace) {
      deleteWebhookMutation.mutate(workspace.id, {
        onSuccess: () => {
          setWebhookUrl('');
          setWebhookSecret('');
          setWebhookEnabled(true);
          setWebhookEvents([]);
          setTestResult(null);
        },
      });
    }
  };

  const handleTestWebhook = () => {
    if (workspace) {
      setTestResult(null);
      testWebhookMutation.mutate(workspace.id, {
        onSuccess: (result) => {
          setTestResult(result);
        },
        onError: (error) => {
          setTestResult({ success: false, error: error.message });
        },
      });
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSaveWebhook = webhookUrl && isValidUrl(webhookUrl) && webhookEvents.length > 0;

  if (!workspace) {
    return null;
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    transition: 'all var(--transition-fast)',
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-tertiary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)' }}>
            Workspace Settings
          </span>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-tertiary)',
          }}
        >
          <button
            onClick={() => setActiveTab('general')}
            style={tabStyle(activeTab === 'general')}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            style={tabStyle(activeTab === 'webhooks')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Webhook size={14} />
              Webhooks
            </span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'general' ? (
            <>
              {/* Workspace Icon */}
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Workspace Icon</label>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* Current Icon Preview */}
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      background: icon
                        ? `url(${icon}) center/cover no-repeat`
                        : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '24px',
                      color: 'white',
                      flexShrink: 0,
                      border: '2px solid var(--color-border)',
                    }}
                  >
                    {!icon && name.charAt(0).toUpperCase()}
                  </div>

                  {/* Upload Area */}
                  <div style={{ flex: 1 }}>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '16px',
                        border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: dragActive
                          ? 'rgba(157, 88, 191, 0.1)'
                          : 'var(--color-bg-tertiary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'center',
                      }}
                    >
                      <Upload
                        size={20}
                        style={{
                          color: dragActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          marginBottom: '8px',
                        }}
                      />
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        Drop an image here or click to upload
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        PNG, JPG, or GIF (max 2MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    {icon && (
                      <button
                        onClick={handleRemoveIcon}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '10px',
                          padding: '6px 10px',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--color-secondary)',
                          transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-secondary)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 112, 140, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Remove icon</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Workspace Name */}
              <div>
                <label htmlFor="workspace-name" style={labelStyle}>
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(157, 88, 191, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter workspace name"
                />
              </div>
            </>
          ) : (
            <>
              {/* Webhook URL */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="webhook-url" style={labelStyle}>
                  Webhook URL
                </label>
                <input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: webhookUrl && !isValidUrl(webhookUrl) ? 'var(--color-secondary)' : undefined,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(157, 88, 191, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = webhookUrl && !isValidUrl(webhookUrl) ? 'var(--color-secondary)' : 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="https://example.com/webhook"
                />
                {webhookUrl && !isValidUrl(webhookUrl) && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--color-secondary)' }}>
                    Please enter a valid URL
                  </p>
                )}
              </div>

              {/* Webhook Secret */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="webhook-secret" style={labelStyle}>
                  Secret (optional)
                </label>
                <input
                  id="webhook-secret"
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(157, 88, 191, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Used for HMAC signature verification"
                />
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  If set, requests include an X-Webhook-Signature header
                </p>
              </div>

              {/* Enable Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    onClick={() => setWebhookEnabled(!webhookEnabled)}
                    style={{
                      width: '40px',
                      height: '22px',
                      backgroundColor: webhookEnabled ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                      borderRadius: '11px',
                      position: 'relative',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: webhookEnabled ? '20px' : '2px',
                        transition: 'all var(--transition-fast)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    Enable webhook
                  </span>
                </label>
              </div>

              {/* Event Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Events to Send</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                  }}
                >
                  {WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        backgroundColor: webhookEvents.includes(event)
                          ? 'rgba(157, 88, 191, 0.1)'
                          : 'var(--color-bg-tertiary)',
                        border: `1px solid ${webhookEvents.includes(event) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div
                        onClick={() => handleEventToggle(event)}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: `2px solid ${webhookEvents.includes(event) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          backgroundColor: webhookEvents.includes(event) ? 'var(--color-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {webhookEvents.includes(event) && <Check size={10} color="white" />}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                        {EVENT_LABELS[event]}
                      </span>
                    </label>
                  ))}
                </div>
                {webhookUrl && webhookEvents.length === 0 && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--color-secondary)' }}>
                    Select at least one event
                  </p>
                )}
              </div>

              {/* Test Result */}
              {testResult && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: testResult.success
                      ? 'rgba(52, 211, 153, 0.1)'
                      : 'rgba(255, 112, 140, 0.1)',
                    border: `1px solid ${testResult.success ? 'rgb(52, 211, 153)' : 'var(--color-secondary)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {testResult.success ? (
                    <Check size={16} style={{ color: 'rgb(52, 211, 153)' }} />
                  ) : (
                    <AlertCircle size={16} style={{ color: 'var(--color-secondary)' }} />
                  )}
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    {testResult.success ? 'Test webhook sent successfully!' : `Test failed: ${testResult.error}`}
                  </span>
                </div>
              )}

              {/* Test Button */}
              {webhookConfig && (
                <button
                  onClick={handleTestWebhook}
                  disabled={testWebhookMutation.isPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: testWebhookMutation.isPending ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                    opacity: testWebhookMutation.isPending ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!testWebhookMutation.isPending) {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <Send size={14} />
                  {testWebhookMutation.isPending ? 'Sending...' : 'Send Test Webhook'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: activeTab === 'webhooks' && webhookConfig ? 'space-between' : 'flex-end',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-tertiary)',
          }}
        >
          {activeTab === 'webhooks' && webhookConfig && (
            <button
              type="button"
              onClick={handleDeleteWebhook}
              disabled={deleteWebhookMutation.isPending}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: deleteWebhookMutation.isPending ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-secondary)',
                transition: 'all var(--transition-fast)',
                opacity: deleteWebhookMutation.isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!deleteWebhookMutation.isPending) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 112, 140, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {deleteWebhookMutation.isPending ? 'Deleting...' : 'Delete Webhook'}
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              Cancel
            </button>
            {activeTab === 'general' ? (
              <button
                type="button"
                onClick={handleSaveGeneral}
                disabled={!name.trim() || updateWorkspaceMutation.isPending}
                style={{
                  padding: '8px 20px',
                  backgroundColor:
                    name.trim() && !updateWorkspaceMutation.isPending
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-hover)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor:
                    name.trim() && !updateWorkspaceMutation.isPending ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 500,
                  color:
                    name.trim() && !updateWorkspaceMutation.isPending
                      ? 'white'
                      : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (name.trim() && !updateWorkspaceMutation.isPending) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {updateWorkspaceMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveWebhook}
                disabled={!canSaveWebhook || saveWebhookMutation.isPending}
                style={{
                  padding: '8px 20px',
                  backgroundColor:
                    canSaveWebhook && !saveWebhookMutation.isPending
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-hover)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor:
                    canSaveWebhook && !saveWebhookMutation.isPending ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 500,
                  color:
                    canSaveWebhook && !saveWebhookMutation.isPending
                      ? 'white'
                      : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (canSaveWebhook && !saveWebhookMutation.isPending) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {saveWebhookMutation.isPending ? 'Saving...' : webhookConfig ? 'Update Webhook' : 'Save Webhook'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
