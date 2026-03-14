import React, { useCallback, useRef, useState } from 'react'
import { Modal } from '../shared/Modal'
import { QuoteCanvas } from './QuoteCanvas'
import { BackgroundPicker } from './BackgroundPicker'
import { TemplatePicker } from './TemplatePicker'
import { TextOverlayEditor } from './TextOverlayEditor'
import { ExportControls } from './ExportControls'
import { useQuoteStore } from '@/store/quoteStore'
import type { QuoteBackground, QuoteTextStyle } from '@/types/quote'

export function QuoteStudio() {
  const { isOpen, config, updateConfig, closeQuoteStudio, exportImage } = useQuoteStore()
  const [isExporting, setIsExporting] = useState(false)
  const exportFnRef = useRef<((format?: 'png' | 'jpeg') => string) | null>(null)
  const [activeTab, setActiveTab] = useState<'text' | 'background' | 'template'>('text')

  const handleCanvasReady = useCallback((fn: (format?: 'png' | 'jpeg') => string) => {
    exportFnRef.current = fn
  }, [])

  const handleExport = async () => {
    if (!exportFnRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = exportFnRef.current('png')
      await exportImage(dataUrl)
    } finally {
      setIsExporting(false)
    }
  }

  const TABS = [
    { id: 'text', label: 'Text' },
    { id: 'background', label: 'Background' },
    { id: 'template', label: 'Template' },
  ] as const

  return (
    <Modal isOpen={isOpen} onClose={closeQuoteStudio} size="full" className="h-[90vh]">
      <div className="flex h-full">
        {/* Left panel - controls */}
        <div className="w-80 flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="text-white font-semibold">Quote Studio</h2>
              <p className="text-white/40 text-xs">Create shareable quote images</p>
            </div>
            <button onClick={closeQuoteStudio} className="text-white/40 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.id ? 'text-white border-b-2 border-ink-500' : 'text-white/40 hover:text-white/70'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'text' && (
              <TextOverlayEditor
                text={config.text}
                attribution={config.attribution}
                textStyle={config.textStyle}
                onTextChange={text => updateConfig({ text })}
                onAttributionChange={attribution => updateConfig({ attribution })}
                onStyleChange={textStyle => updateConfig({ textStyle })}
              />
            )}

            {activeTab === 'background' && (
              <BackgroundPicker
                value={config.background}
                onChange={background => updateConfig({ background: background as QuoteBackground })}
              />
            )}

            {activeTab === 'template' && (
              <TemplatePicker
                value={config.template}
                onChange={template => updateConfig({ template })}
              />
            )}
          </div>

          {/* Export controls */}
          <div className="p-5 border-t border-white/10">
            <ExportControls onExport={handleExport} isExporting={isExporting} />
          </div>
        </div>

        {/* Right panel - preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-neutral-950 overflow-auto">
          <div className="w-full max-w-lg">
            <QuoteCanvas config={config} onCanvasReady={handleCanvasReady} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
