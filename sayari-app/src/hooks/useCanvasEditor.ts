import { useRef, useState, useCallback, useEffect } from 'react'
import * as fabric from 'fabric'
import type { Template, Asset } from '../types'

export interface TextStyle {
  fontFamily: string
  fontSize  : number
  fill      : string
  fontWeight: string
  textAlign : 'left' | 'center' | 'right'
  fontStyle : 'normal' | 'italic' | 'oblique'
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Noto Nastaliq Urdu',
  fontSize  : 48,
  fill      : '#FFFFFF',
  fontWeight: 'normal',
  textAlign : 'center',
  fontStyle : 'normal',
}

export function useCanvasEditor(width: number, height: number) {
  const canvasElRef   = useRef<HTMLCanvasElement>(null)
  const fabricRef     = useRef<fabric.Canvas | null>(null)
  const [ready, setReady]               = useState(false)
  const [selectedObject, setSelected]   = useState<fabric.Object | null>(null)
  const [textStyle, setTextStyleState]  = useState<TextStyle>(DEFAULT_TEXT_STYLE)
  const [history, setHistory]           = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const skipHistoryRef = useRef(false)

  // ── Initialise canvas ────────────────────────
  useEffect(() => {
    if (!canvasElRef.current) return

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width, height,
      backgroundColor: '#1a1a2e',
      preserveObjectStacking: true,
    })

    fabricRef.current = canvas
    setReady(true)

    canvas.on('selection:created', (e) => setSelected(e.selected?.[0] ?? null))
    canvas.on('selection:updated', (e) => setSelected(e.selected?.[0] ?? null))
    canvas.on('selection:cleared', () => setSelected(null))

    canvas.on('object:modified', saveHistorySnapshot)
    canvas.on('object:added',    saveHistorySnapshot)
    canvas.on('object:removed',  saveHistorySnapshot)

    return () => { canvas.dispose(); fabricRef.current = null }
  }, [])

  // ── History (undo/redo) ──────────────────────
  const saveHistorySnapshot = useCallback(() => {
    if (skipHistoryRef.current || !fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    setHistory(prev => {
      const next = [...prev.slice(0, historyIndex + 1), json]
      return next.slice(-30) // cap at 30 steps
    })
    setHistoryIndex(prev => Math.min(prev + 1, 29))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return
    skipHistoryRef.current = true
    const prevState = history[historyIndex - 1]
    fabricRef.current.loadFromJSON(JSON.parse(prevState)).then(() => {
      fabricRef.current?.renderAll()
      setHistoryIndex(i => i - 1)
      skipHistoryRef.current = false
    })
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return
    skipHistoryRef.current = true
    const nextState = history[historyIndex + 1]
    fabricRef.current.loadFromJSON(JSON.parse(nextState)).then(() => {
      fabricRef.current?.renderAll()
      setHistoryIndex(i => i + 1)
      skipHistoryRef.current = false
    })
  }, [history, historyIndex])

  // ── Add text ──────────────────────────────────
  const addText = useCallback((text = 'Apna lafz yahan likhein...') => {
    if (!fabricRef.current) return
    const textbox = new fabric.Textbox(text, {
      left: width / 2, top: height / 2,
      originX: 'center', originY: 'center',
      width: width * 0.7,
      ...textStyle,
    })
    fabricRef.current.add(textbox)
    fabricRef.current.setActiveObject(textbox)
    fabricRef.current.renderAll()
  }, [width, height, textStyle])

  // ── Update selected text style ───────────────
  const updateTextStyle = useCallback((updates: Partial<TextStyle>) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    setTextStyleState(prev => ({ ...prev, ...updates }))
    if (obj && obj.type === 'textbox') {
      obj.set(updates as Record<string, unknown>)
      fabricRef.current.renderAll()
      saveHistorySnapshot()
    }
  }, [saveHistorySnapshot])

  // ── Set background colour ────────────────────
  const setBackgroundColor = useCallback((color: string) => {
    if (!fabricRef.current) return
    fabricRef.current.backgroundColor = color
    fabricRef.current.set('backgroundImage', undefined)
    fabricRef.current.renderAll()
  }, [])

  // ── Set background gradient ───────────────────
  const setBackgroundGradient = useCallback((colors: [string, string]) => {
    if (!fabricRef.current) return
    const canvas = fabricRef.current
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: width, y2: height },
      colorStops: [{ offset: 0, color: colors[0] }, { offset: 1, color: colors[1] }],
    })
    canvas.set('backgroundImage', undefined)
    canvas.backgroundColor = gradient as unknown as string
    canvas.renderAll()
  }, [width, height])

  // ── Set background from template image ───────
  const setBackgroundImage = useCallback(async (imageUrl: string) => {
    if (!fabricRef.current) return
    const canvas = fabricRef.current
    const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
    img.set({
      scaleX: width  / (img.width  || width),
      scaleY: height / (img.height || height),
      originX: 'left', originY: 'top',
      left: 0, top: 0,
    })
    canvas.backgroundImage = img
    canvas.renderAll()
  }, [width, height])

  // ── Add sticker ───────────────────────────────
  const addSticker = useCallback(async (imageUrl: string) => {
    if (!fabricRef.current) return
    const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
    const scale = Math.min(150 / (img.width || 150), 150 / (img.height || 150))
    img.set({
      left: width / 2, top: height / 2,
      originX: 'center', originY: 'center',
      scaleX: scale, scaleY: scale,
    })
    fabricRef.current.add(img)
    fabricRef.current.setActiveObject(img)
    fabricRef.current.renderAll()
  }, [width, height])

  // ── Delete selected object ────────────────────
  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getActiveObject()
    if (obj) {
      fabricRef.current.remove(obj)
      fabricRef.current.renderAll()
    }
  }, [])

  // ── Bring forward / send backward ─────────────
  const bringForward = useCallback(() => {
    const obj = fabricRef.current?.getActiveObject()
    if (obj && fabricRef.current) { fabricRef.current.bringObjectForward(obj); fabricRef.current.renderAll() }
  }, [])

  const sendBackward = useCallback(() => {
    const obj = fabricRef.current?.getActiveObject()
    if (obj && fabricRef.current) { fabricRef.current.sendObjectBackwards(obj); fabricRef.current.renderAll() }
  }, [])

  // ── Duplicate selected ────────────────────────
  const duplicateSelected = useCallback(async () => {
    const obj = fabricRef.current?.getActiveObject()
    if (!obj || !fabricRef.current) return
    const cloned = await obj.clone()
    cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 })
    fabricRef.current.add(cloned)
    fabricRef.current.setActiveObject(cloned)
    fabricRef.current.renderAll()
  }, [])

  // ── Export canvas as JSON (for backend render) ──
  const exportJSON = useCallback(() => {
    return fabricRef.current?.toJSON() ?? null
  }, [])

  // ── Export canvas as PNG (preview) ───────────
  const exportPNG = useCallback((multiplier = 2) => {
    return fabricRef.current?.toDataURL({ format: 'png', multiplier, quality: 1 }) ?? null
  }, [])

  // ── Load existing canvas state ───────────────
  const loadFromJSON = useCallback(async (json: object) => {
    if (!fabricRef.current) return
    skipHistoryRef.current = true
    await fabricRef.current.loadFromJSON(json)
    fabricRef.current.renderAll()
    skipHistoryRef.current = false
    saveHistorySnapshot()
  }, [saveHistorySnapshot])

  // ── Clear canvas ──────────────────────────────
  const clearCanvas = useCallback(() => {
    fabricRef.current?.clear()
    fabricRef.current?.renderAll()
  }, [])

  return {
    canvasElRef, ready, selectedObject, textStyle,
    addText, updateTextStyle,
    setBackgroundColor, setBackgroundGradient, setBackgroundImage,
    addSticker, deleteSelected, bringForward, sendBackward, duplicateSelected,
    exportJSON, exportPNG, loadFromJSON, clearCanvas,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
    getCanvas: () => fabricRef.current,
  }
}
