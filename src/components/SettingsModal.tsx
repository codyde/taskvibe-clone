import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useWorkspaces, useUpdateWorkspace } from '../hooks/useWorkspaces';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { data: workspaces = [] } = useWorkspaces();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspace = workspaces[0];

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Initialize form when workspace loads
  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setIcon(workspace.icon || null);
    }
  }, [workspace]);

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

  const handleSave = () => {
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

  if (!workspace) {
    return null;
  }

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
          maxWidth: '480px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
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

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Workspace Icon */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Workspace Icon
            </label>

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
            <label
              htmlFor="workspace-name"
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Workspace Name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
              }}
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
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-tertiary)',
          }}
        >
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
          <button
            type="button"
            onClick={handleSave}
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
        </div>
      </div>
    </div>
  );
}
