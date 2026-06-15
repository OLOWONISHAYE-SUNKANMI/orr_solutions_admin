"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
   Plus, X, Type, Image as ImageIcon, Square, Circle, Triangle, 
   AlignLeft, AlignCenter, AlignRight, Play, Copy, Trash2, Palette, Star, ArrowRight, Maximize2, Move
} from 'lucide-react';
import { 
   DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { 
   arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SlidesEditorProps {
   content: string;
   onChange: (content: string) => void;
   title: string;
   onTitleChange: (title: string) => void;
}

interface Slide {
   id: string;
   title: string;
   canvasData: any;
   bg?: string;
}

// ---------------------------------------------------------
// Slide Thumbnail Component (Sortable)
// ---------------------------------------------------------
function SortableSlideItem({ id, slide, idx, isActive, onClick, onDelete, onDuplicate }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative flex items-start gap-2 group mb-3">
            <div className="text-[10px] font-medium text-gray-500 mt-1 w-4 text-right">{idx + 1}</div>
            <div
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`flex-1 aspect-video rounded border transition-all cursor-pointer relative overflow-hidden bg-white shadow-sm ${isActive ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-gray-200 hover:border-gray-300'}`}
            >
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 bg-white/80 rounded p-0.5 backdrop-blur-sm">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Duplicate">
                        <Copy size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={12} />
                    </button>
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center p-2" style={{ backgroundColor: slide.bg || '#ffffff' }}>
                    <div className="text-[10px] font-medium text-gray-500 truncate w-full text-center mix-blend-multiply">{slide.title || 'Slide ' + (idx + 1)}</div>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Main Editor Component
// ---------------------------------------------------------
export default function SlidesEditor({ content, onChange, title, onTitleChange }: SlidesEditorProps) {
   const [slides, setSlides] = useState<Slide[]>([]);
   const [activeSlideId, setActiveSlideId] = useState<string>('');
   const [isFullscreen, setIsFullscreen] = useState(false);
   
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   // Sensors for drag-and-drop
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
   );

   // ---------------------------------------------------------
   // Initialization
   // ---------------------------------------------------------
   useEffect(() => {
      let initialSlides: Slide[] = [];
      try {
         if (content && content.startsWith('[')) {
            const parsed = JSON.parse(content);
            if (parsed.length > 0) {
               initialSlides = parsed.map((s: any) => ({ ...s, id: s.id.toString() }));
            }
         }
      } catch { }
      
      if (initialSlides.length === 0) {
         initialSlides = [{ id: '1', title: 'Title Slide', canvasData: null, bg: '#ffffff' }];
      }
      
      setSlides(initialSlides);
      setActiveSlideId(initialSlides[0].id);
   }, []); 

   // Initialize Canvas
   useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
         width: 800,
         height: 450,
         backgroundColor: '#ffffff',
         selection: true,
         preserveObjectStacking: true
      });
      fabricCanvasRef.current = canvas;

      // Snap to grid logic
      const gridSize = 20;
      canvas.on('object:moving', (options) => {
         if (!options.target) return;
         options.target.set({
            left: Math.round(options.target.left! / gridSize) * gridSize,
            top: Math.round(options.target.top! / gridSize) * gridSize
         });
      });

      const handleSave = () => {
         if (!fabricCanvasRef.current || !activeSlideId) return;
         const json = fabricCanvasRef.current.toJSON();
         
         setSlides(prev => {
            const newSlides = prev.map(s => s.id === activeSlideId ? { ...s, canvasData: json } : s);
            onChange(JSON.stringify(newSlides));
            return newSlides;
         });
      };

      canvas.on('object:modified', handleSave);
      canvas.on('object:added', handleSave);
      canvas.on('object:removed', handleSave);
      // Listen for text changes
      (canvas as any).on('text:changed', handleSave);

      return () => {
         canvas.dispose();
         fabricCanvasRef.current = null;
      };
   }, [activeSlideId]); // Re-bind when active ID changes so closure is updated

   // Load Canvas Data when Active Slide Changes
   useEffect(() => {
      if (!fabricCanvasRef.current || slides.length === 0 || !activeSlideId) return;
      
      const currentSlide = slides.find(s => s.id === activeSlideId);
      if (currentSlide && currentSlide.canvasData) {
         fabricCanvasRef.current.loadFromJSON(currentSlide.canvasData, () => {
            fabricCanvasRef.current?.renderAll();
         });
      } else {
         fabricCanvasRef.current.clear();
         fabricCanvasRef.current.backgroundColor = currentSlide?.bg || '#ffffff';
         fabricCanvasRef.current.renderAll();
      }
   }, [activeSlideId]);

   // ---------------------------------------------------------
   // Slide Operations
   // ---------------------------------------------------------
   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
         setSlides((items) => {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);
            const newArray = arrayMove(items, oldIndex, newIndex);
            onChange(JSON.stringify(newArray));
            return newArray;
         });
      }
   };

   const addSlide = () => {
      const newId = Date.now().toString();
      const newSlide = { id: newId, title: 'New Slide', canvasData: null, bg: '#ffffff' };
      setSlides(prev => {
         const updated = [...prev, newSlide];
         onChange(JSON.stringify(updated));
         return updated;
      });
      setActiveSlideId(newId);
   };

   const deleteSlide = (id: string) => {
      if (slides.length <= 1) return alert("Presentations must contain at least one slide.");
      setSlides(prev => {
         const updated = prev.filter(s => s.id !== id);
         onChange(JSON.stringify(updated));
         if (activeSlideId === id) setActiveSlideId(updated[0].id);
         return updated;
      });
   };

   const duplicateSlide = (id: string) => {
      setSlides(prev => {
         const slideToDup = prev.find(s => s.id === id);
         if (!slideToDup) return prev;
         const newId = Date.now().toString();
         const newSlide = { ...slideToDup, id: newId, title: `${slideToDup.title} (Copy)` };
         const index = prev.findIndex(s => s.id === id);
         const updated = [...prev.slice(0, index + 1), newSlide, ...prev.slice(index + 1)];
         onChange(JSON.stringify(updated));
         return updated;
      });
   };

   // ---------------------------------------------------------
   // Canvas Tools
   // ---------------------------------------------------------
   const addText = () => {
      if (!fabricCanvasRef.current) return;
      const text = new fabric.IText('Double click to edit', {
         left: 100, top: 100, fontFamily: 'Inter, sans-serif', fontSize: 32, fill: '#1f2937'
      });
      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
   };

   const addShape = (type: 'rect' | 'circle' | 'triangle') => {
      if (!fabricCanvasRef.current) return;
      let shape;
      const common = { left: 100, top: 100, fill: '#4f46e5' };
      if (type === 'rect') shape = new fabric.Rect({ ...common, width: 100, height: 100 });
      if (type === 'circle') shape = new fabric.Circle({ ...common, radius: 50 });
      if (type === 'triangle') shape = new fabric.Triangle({ ...common, width: 100, height: 100 });
      if (shape) {
         fabricCanvasRef.current.add(shape);
         fabricCanvasRef.current.setActiveObject(shape);
      }
   };

   const changeAlignment = (align: 'left' | 'center' | 'right') => {
      if (!fabricCanvasRef.current) return;
      const activeObj = fabricCanvasRef.current.getActiveObject() as any;
      if (activeObj && activeObj.type === 'i-text') {
         activeObj.set({ textAlign: align });
         fabricCanvasRef.current.requestRenderAll();
         fabricCanvasRef.current.fire('object:modified');
      }
   };

   const changeBackgroundColor = (color: string) => {
       if (!fabricCanvasRef.current) return;
       fabricCanvasRef.current.backgroundColor = color;
       fabricCanvasRef.current.requestRenderAll();
       
       setSlides(prev => {
          const newSlides = prev.map(s => s.id === activeSlideId ? { ...s, bg: color } : s);
          onChange(JSON.stringify(newSlides));
          return newSlides;
       });
   };

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!fabricCanvasRef.current || !e.target.files?.[0]) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (f) => {
         const data = f.target?.result;
         if (data) {
            fabric.Image.fromURL(data as string).then((img) => {
               img.scaleToWidth(200);
               img.set({ left: 100, top: 100 });
               fabricCanvasRef.current?.add(img);
               fabricCanvasRef.current?.setActiveObject(img);
               fabricCanvasRef.current?.fire('object:modified');
            }).catch(err => console.error("Failed to load image", err));
         }
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // reset
   };

   // ---------------------------------------------------------
   // Presenter Mode (Fullscreen)
   // ---------------------------------------------------------
   const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
         containerRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
         });
         setIsFullscreen(true);
      } else {
         document.exitFullscreen();
         setIsFullscreen(false);
      }
   };

   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
   }, []);

   // ---------------------------------------------------------
   // Render
   // ---------------------------------------------------------
   return (
      <div ref={containerRef} className={`flex flex-col bg-[#f8f9fa] ${isFullscreen ? 'w-screen h-screen fixed inset-0 z-50' : 'flex-1 overflow-hidden w-full h-full relative'}`}>
         
         {/* Top Info Bar (Hidden in Fullscreen) */}
         {!isFullscreen && (
            <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 shrink-0 z-30 justify-between">
               <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="flex-1 min-w-[100px] max-w-[200px] sm:max-w-[400px] bg-transparent border-none focus:outline-none text-lg sm:text-xl text-gray-900 font-normal px-2 py-1 hover:bg-gray-50 rounded transition-colors truncate"
                  placeholder="Untitled presentation"
               />
               <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors shadow-sm"
               >
                  <Play size={16} fill="currentColor" />
                  <span className="hidden sm:inline">Slideshow</span>
               </button>
            </div>
         )}

         {/* Main Editor Area */}
         <div className="flex-1 flex overflow-hidden relative">
            
            {/* Slide Navigator (Hidden in Fullscreen) */}
            {!isFullscreen && (
               <div className="w-48 sm:w-56 border-r border-gray-200 bg-white overflow-y-auto p-3 shrink-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <button onClick={addSlide} className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors">
                     <Plus size={16} /> Add Slide
                  </button>
                  
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                     <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {slides.map((slide, idx) => (
                           <SortableSlideItem 
                              key={slide.id} 
                              id={slide.id} 
                              slide={slide} 
                              idx={idx} 
                              isActive={slide.id === activeSlideId}
                              onClick={() => setActiveSlideId(slide.id)}
                              onDelete={() => deleteSlide(slide.id)}
                              onDuplicate={() => duplicateSlide(slide.id)}
                           />
                        ))}
                     </SortableContext>
                  </DndContext>
               </div>
            )}

            {/* Canvas Area */}
            <div className={`flex-1 flex flex-col ${isFullscreen ? 'bg-black' : 'bg-[#f1f3f4]'}`}>
               
               {/* Tools Toolbar (Hidden in Fullscreen) */}
               {!isFullscreen && (
                  <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2 shrink-0 overflow-x-auto scrollbar-hide">
                     <button onClick={addText} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors tooltip-trigger" title="Text box">
                        <Type size={18} />
                     </button>
                     <button onClick={() => addShape('rect')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors tooltip-trigger" title="Rectangle">
                        <Square size={18} />
                     </button>
                     <button onClick={() => addShape('circle')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors tooltip-trigger" title="Circle">
                        <Circle size={18} />
                     </button>
                     <button onClick={() => addShape('triangle')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors tooltip-trigger" title="Triangle">
                        <Triangle size={18} />
                     </button>
                     <label className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer tooltip-trigger" title="Insert Image">
                        <ImageIcon size={18} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>
                     <div className="w-px h-6 bg-gray-300 mx-2" />
                     <button onClick={() => changeAlignment('left')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Align Left">
                        <AlignLeft size={18} />
                     </button>
                     <button onClick={() => changeAlignment('center')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Align Center">
                        <AlignCenter size={18} />
                     </button>
                     <button onClick={() => changeAlignment('right')} className="p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Align Right">
                        <AlignRight size={18} />
                     </button>
                     <div className="w-px h-6 bg-gray-300 mx-2" />
                     <div className="flex items-center gap-1">
                        <Palette size={18} className="text-gray-500 ml-1" />
                        <input 
                           type="color" 
                           onChange={(e) => changeBackgroundColor(e.target.value)}
                           className="w-8 h-8 rounded border-none cursor-pointer p-0 bg-transparent"
                           title="Background Color"
                        />
                     </div>
                  </div>
               )}

               {/* Canvas Wrapper */}
               <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                  <div 
                     className={`bg-white shrink-0 relative transition-transform ${isFullscreen ? 'shadow-none' : 'shadow-lg border border-gray-300'}`} 
                     style={{ 
                        width: 800, 
                        height: 450,
                        transform: isFullscreen ? 'scale(1.5)' : 'scale(1)' // Basic scaling for demo
                     }}
                  >
                     <canvas ref={canvasRef} />
                     
                     {isFullscreen && (
                        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between text-white bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                           <span>Slide {slides.findIndex(s => s.id === activeSlideId) + 1} of {slides.length}</span>
                           <span>Press ESC to exit</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
