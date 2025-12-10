import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../components/Sidebar'
import { IssueList } from '../components/IssueList'
import { IssueDetail } from '../components/IssueDetail'
import { CreateIssueModal } from '../components/CreateIssueModal'
import { SettingsModal } from '../components/SettingsModal'
import { useSelectedIssue, setSelectedIssue } from '../store'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const selectedIssue = useSelectedIssue()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowCreateModal(true)
      }

      if (e.key === 'Escape') {
        if (showSettingsModal) {
          setShowSettingsModal(false)
        } else if (showCreateModal) {
          setShowCreateModal(false)
        } else if (selectedIssue) {
          setSelectedIssue(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCreateModal, showSettingsModal, selectedIssue])

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      <Sidebar 
        onCreateIssue={() => setShowCreateModal(true)} 
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <main
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <IssueList />
        {selectedIssue && <IssueDetail />}
      </main>

      {showCreateModal && <CreateIssueModal onClose={() => setShowCreateModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  )
}
