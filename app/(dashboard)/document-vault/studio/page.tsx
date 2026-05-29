"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   FileText,
   ExternalLink,
   Zap,
   Save,
   Share2,
   History,
   MessageSquare,
   Maximize2,
   ChevronLeft,
   MoreVertical,
   Layers,
   Activity,
   Download,
   Globe,
   Lock,
   Plus,
   Loader2,
   CheckCircle2,
   Sparkles,
   ArrowRight,
   Bold,
   Italic,
   Underline,
   AlignLeft,
   AlignCenter,
   AlignRight,
   Type,
   Image as ImageIcon,
   Table as TableIcon,
   Grid3X3,
   Presentation,
   Type as FontIcon,
   Search,
   PlusCircle,
   X,
   FileCode,
   FileSpreadsheet,
   PlaySquare,
   DownloadCloud,
   MoreHorizontal,
   UserPlus,
   Folder,
   FolderPlus,
   ChevronDown,
   ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import UploadDocumentModal from '@/app/(dashboard)/document-vault/UploadDocumentModal';

interface DocumentAsset {
   id: string;
   title: string;
   type: 'doc' | 'sheet' | 'slide';
   lastEdited: string;
   progress: number;
   content: string;
   folderId: string | null;
}

import { useVaultStore } from '@/store/vaultStore';
import { useClientStore } from '@/store/clientStore';
import { vaultApi } from '@/lib/vault-api';

export default function DocumentStudioPage() {
   const { t } = useLanguageStore();
   const { documents: drafts, folders: storeFolders, isLoadingDocuments: isLoading, fetchDocuments, fetchFolders, createGoogleDoc, createFolder: storeCreateFolder, updateDocumentMetadata } = useVaultStore();
   const { clients, fetchClients } = useClientStore();

   React.useEffect(() => {
      fetchDocuments(undefined, true);
      fetchFolders();
      fetchClients();
   }, [fetchDocuments, fetchFolders, fetchClients]);

   const [activeDocument, setActiveDocument] = useState<any | null>(null);
   const pendingSelectRef = React.useRef<string | null>(null);
   const isMock = activeDocument?.google_drive_id?.startsWith('mock_') || activeDocument?.link?.includes('mock_');

   // Auto-select newly created document after drafts update
   React.useEffect(() => {
      if (pendingSelectRef.current && drafts.length > 0) {
         const target = drafts.find(d => d.title === pendingSelectRef.current);
         if (target) {
            setActiveDocument({ ...target, content: target.description || target.content || '' });
            pendingSelectRef.current = null;
         }
      }
   }, [drafts]);

   React.useEffect(() => {
      if (activeDocument && isMock) {
         console.warn("Sandbox Mode: Using local interactive workspace. All changes are saved to the server.");
      }
   }, [activeDocument, isMock]);

    const [isSaving, setIsSaving] = useState(false);
    const [font, setFont] = useState('Inter');
    const [fontSize, setFontSize] = useState('14');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    const editorRef = React.useRef<HTMLDivElement>(null);
    const savedSelectionRef = React.useRef<Range | null>(null);

    React.useEffect(() => {
       const updateToolbarStates = () => {
          const boldActive = document.queryCommandState('bold');
          const italicActive = document.queryCommandState('italic');
          const underlineActive = document.queryCommandState('underline');
          
          const boldBtn = document.getElementById('toolbar-btn-bold');
          if (boldBtn) {
             if (boldActive) {
                boldBtn.classList.add('bg-primary', 'text-slate-900');
                boldBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
             } else {
                boldBtn.classList.remove('bg-primary', 'text-slate-900');
                boldBtn.classList.add('text-slate-400', 'hover:bg-white/5');
             }
          }
          const italicBtn = document.getElementById('toolbar-btn-italic');
          if (italicBtn) {
             if (italicActive) {
                italicBtn.classList.add('bg-primary', 'text-slate-900');
                italicBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
             } else {
                italicBtn.classList.remove('bg-primary', 'text-slate-900');
                italicBtn.classList.add('text-slate-400', 'hover:bg-white/5');
             }
          }
          const underlineBtn = document.getElementById('toolbar-btn-underline');
          if (underlineBtn) {
             if (underlineActive) {
                underlineBtn.classList.add('bg-primary', 'text-slate-900');
                underlineBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
             } else {
                underlineBtn.classList.remove('bg-primary', 'text-slate-900');
                underlineBtn.classList.add('text-slate-400', 'hover:bg-white/5');
             }
          }

                   // Update select values based on cursor styling
           const selection = window.getSelection();
           if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              let element = (range.commonAncestorContainer.nodeType === 1 
                 ? range.commonAncestorContainer 
                 : range.commonAncestorContainer.parentElement) as any;
              
              if (element) {
                 let currentFont = 'Inter';
                 let currentSize = '14';
                 let tempEl = element;
                 
                 const editor = editorRef.current || slideContentRef.current;
                 
                 while (tempEl && editor && editor.contains(tempEl)) {
                    if (tempEl.style && tempEl.style.fontFamily) {
                       currentFont = tempEl.style.fontFamily.replace(/['"]/g, '');
                       break;
                    }
                    if (tempEl.tagName && tempEl.tagName.toLowerCase() === 'font' && tempEl.getAttribute('face')) {
                       currentFont = tempEl.getAttribute('face').replace(/['"]/g, '');
                       break;
                    }
                    tempEl = tempEl.parentElement;
                 }
                 
                 tempEl = element;
                 while (tempEl && editor && editor.contains(tempEl)) {
                    if (tempEl.style && tempEl.style.fontSize) {
                       currentSize = tempEl.style.fontSize.replace('px', '');
                       break;
                    }
                    tempEl = tempEl.parentElement;
                 }
                 
                 const fontSelect = document.getElementById('toolbar-select-font') as any;
                 if (fontSelect && fontSelect.value !== currentFont) {
                    fontSelect.value = currentFont;
                 }
                 
                 const sizeSelect = document.getElementById('toolbar-select-size') as any;
                 if (sizeSelect && sizeSelect.value !== currentSize) {
                    sizeSelect.value = currentSize;
                 }
              }
           }
        };

       const saveSelection = () => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
             const range = selection.getRangeAt(0);
             const container = range.commonAncestorContainer;
             const isInsideEditor = 
                (editorRef.current && editorRef.current.contains(container)) ||
                (slideContentRef.current && slideContentRef.current.contains(container));
             if (isInsideEditor) {
                savedSelectionRef.current = range.cloneRange();
                updateToolbarStates();
             }
          }
       };
       document.addEventListener('selectionchange', saveSelection);
       return () => {
          document.removeEventListener('selectionchange', saveSelection);
       };
    }, []);

    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const slideContentRef = React.useRef<HTMLDivElement>(null);

    // Reset slide index when document changes
    React.useEffect(() => {
       setActiveSlideIndex(0);
    }, [activeDocument?.id]);

    interface Slide {
       id: number;
       title: string;
       subtitle: string;
       content: string;
    }

    const getSlides = (): Slide[] => {
       try {
          if (activeDocument?.content && activeDocument.content.startsWith('[')) {
             return JSON.parse(activeDocument.content);
          }
       } catch {}
       return [
          { id: 1, title: activeDocument?.title || 'Slide 1 Title', subtitle: 'Presentation Overview', content: '<div>Drafting presentation layer...</div>' }
       ];
    };

    // Sync active slide content to ref on active slide or document change
    React.useEffect(() => {
       const isSlideActive = activeDocument?.type === 'slide' || activeDocument?.type === 'pptx' || activeDocument?.type === 'google_slide';
        if (isSlideActive && slideContentRef.current) {
          const slides = getSlides();
          const currentSlide = slides[activeSlideIndex];
          if (currentSlide && slideContentRef.current.innerHTML !== (currentSlide.content || '')) {
             slideContentRef.current.innerHTML = currentSlide.content || '';
          }
       }
    }, [activeDocument?.id, activeSlideIndex]);

    const handleSlideContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
       // Do not update activeDocument.content to prevent cursor reset.
    };

    const saveCurrentSlideDOMToState = () => {
        const isSlideActive = activeDocument?.type === 'slide' || activeDocument?.type === 'pptx' || activeDocument?.type === 'google_slide';
        if (isSlideActive && slideContentRef.current) {
           const html = slideContentRef.current.innerHTML;
           const slides = getSlides();
           if (slides[activeSlideIndex]) {
              slides[activeSlideIndex].content = html;
              setActiveDocument((prev: any) => prev ? Object.assign({}, prev, { content: JSON.stringify(slides) }) : null);
           }
        }
     };

     const updateSlideTitle = (newTitle: string) => {
        const slides = getSlides();
        if (slides[activeSlideIndex]) {
           if (slideContentRef.current) {
              slides[activeSlideIndex].content = slideContentRef.current.innerHTML;
           }
           slides[activeSlideIndex].title = newTitle;
           setActiveDocument((prev: any) => prev ? Object.assign({}, prev, { content: JSON.stringify(slides) }) : null);
        }
     };

     const updateSlideSubtitle = (newSubtitle: string) => {
        const slides = getSlides();
        if (slides[activeSlideIndex]) {
           if (slideContentRef.current) {
              slides[activeSlideIndex].content = slideContentRef.current.innerHTML;
           }
           slides[activeSlideIndex].subtitle = newSubtitle;
           setActiveDocument((prev: any) => prev ? Object.assign({}, prev, { content: JSON.stringify(slides) }) : null);
        }
     };

     const addSlide = () => {
        saveCurrentSlideDOMToState();
        const slides = getSlides();
        const newSlideId = slides.length > 0 ? Math.max(...slides.map(s => s.id)) + 1 : 1;
        const newSlide = {
           id: newSlideId,
           title: 'New Slide Title',
           subtitle: 'Slide Subtitle Layer',
           content: '<div>Start typing new slide content here...</div>'
        };
        const updatedSlides = [...slides, newSlide];
        setActiveDocument((prev: any) => prev ? Object.assign({}, prev, { content: JSON.stringify(updatedSlides) }) : null);
        setActiveSlideIndex(updatedSlides.length - 1);
     };

     const deleteSlide = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const slides = getSlides();
        if (slides.length <= 1) {
           alert("Presentations must contain at least one slide.");
           return;
        }
        if (slideContentRef.current && slides[activeSlideIndex]) {
           slides[activeSlideIndex].content = slideContentRef.current.innerHTML;
        }
        const updatedSlides = slides.filter((_, idx) => idx !== index);
        setActiveDocument((prev: any) => prev ? Object.assign({}, prev, { content: JSON.stringify(updatedSlides) }) : null);
        setActiveSlideIndex(Math.max(0, index - 1));
     };

    // Sync state content to ref once when document changes
    React.useEffect(() => {
       if (activeDocument && editorRef.current) {
          if (editorRef.current.innerHTML !== (activeDocument.content || '')) {
             editorRef.current.innerHTML = activeDocument.content || '';
          }
       }
    }, [activeDocument?.id]);

    const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
       // Do nothing or let local DOM manage state during live editing to avoid keypress lags
    };

    const handleEditorBlur = (e: React.FocusEvent<HTMLDivElement>) => {
       // Do not update activeDocument.content to prevent cursor reset.
    };

    const syncActiveEditorContent = () => {
       // We intentionally do not update activeDocument.content here.
       // Updating state on every keystroke or format causes React to re-render
       // the dangerouslySetInnerHTML prop, which destroys the user's cursor selection.
       // The latest content is read directly from the DOM refs in handleSave().
    };

    const triggerToolbarStateUpdate = () => {
        const boldActive = document.queryCommandState('bold');
        const italicActive = document.queryCommandState('italic');
        const underlineActive = document.queryCommandState('underline');
        
        const boldBtn = document.getElementById('toolbar-btn-bold');
        if (boldBtn) {
           if (boldActive) {
              boldBtn.classList.add('bg-primary', 'text-slate-900');
              boldBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
           } else {
              boldBtn.classList.remove('bg-primary', 'text-slate-900');
              boldBtn.classList.add('text-slate-400', 'hover:bg-white/5');
           }
        }
        const italicBtn = document.getElementById('toolbar-btn-italic');
        if (italicBtn) {
           if (italicActive) {
              italicBtn.classList.add('bg-primary', 'text-slate-900');
              italicBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
           } else {
              italicBtn.classList.remove('bg-primary', 'text-slate-900');
              italicBtn.classList.add('text-slate-400', 'hover:bg-white/5');
           }
        }
        const underlineBtn = document.getElementById('toolbar-btn-underline');
        if (underlineBtn) {
           if (underlineActive) {
              underlineBtn.classList.add('bg-primary', 'text-slate-900');
              underlineBtn.classList.remove('text-slate-400', 'hover:bg-white/5');
           } else {
              underlineBtn.classList.remove('bg-primary', 'text-slate-900');
              underlineBtn.classList.add('text-slate-400', 'hover:bg-white/5');
           }
        }
     };

     const toggleBold = () => {
        restoreSelection();
        document.execCommand('bold', false);
        triggerToolbarStateUpdate();
        syncActiveEditorContent();
     };
 
     const toggleItalic = () => {
        restoreSelection();
        document.execCommand('italic', false);
        triggerToolbarStateUpdate();
        syncActiveEditorContent();
     };
 
     const toggleUnderline = () => {
        restoreSelection();
        document.execCommand('underline', false);
        triggerToolbarStateUpdate();
        syncActiveEditorContent();
     };
 
     const imageInputRef = React.useRef<HTMLInputElement>(null);
 
     const restoreSelection = () => {
        const isSlideActive = activeDocument?.type === 'slide' || activeDocument?.type === 'pptx' || activeDocument?.type === 'google_slide';
        const editor = isSlideActive ? slideContentRef.current : editorRef.current;
        if (editor) {
           editor.focus();
        }
        const selection = window.getSelection();
        if (selection) {
           if (savedSelectionRef.current) {
              selection.removeAllRanges();
              selection.addRange(savedSelectionRef.current);
           } else if (editor) {
              const range = document.createRange();
              range.selectNodeContents(editor);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              savedSelectionRef.current = range.cloneRange();
           }
        }
     };
 
     const handleFontChange = (selectedFont: string) => {
         restoreSelection();
         
         const selection = window.getSelection();
         if (!selection || selection.rangeCount === 0) return;
         const range = selection.getRangeAt(0);
         
         const isSlideActive = activeDocument?.type === 'slide' || activeDocument?.type === 'pptx' || activeDocument?.type === 'google_slide';
         const editor = isSlideActive ? slideContentRef.current : editorRef.current;
         if (!editor) return;
  
         if (range.collapsed) {
            const span = document.createElement('span');
            span.style.fontFamily = selectedFont;
            span.innerHTML = '&#8203;';
            range.insertNode(span);
            
            const newRange = document.createRange();
            if (span.firstChild) {
               newRange.setStart(span.firstChild, 1);
               newRange.setEnd(span.firstChild, 1);
               selection.removeAllRanges();
               selection.addRange(newRange);
               savedSelectionRef.current = newRange.cloneRange();
            }
         } else {
            const tempId = 'temp-font-' + Date.now();
            document.execCommand('fontName', false, tempId);
            const elements = editor.querySelectorAll('font[face="' + tempId + '"], span[style*="' + tempId + '"]');
            if (elements.length === 0) {
               document.execCommand('fontName', false, selectedFont);
            } else {
               elements.forEach((el: any) => {
                  el.style.fontFamily = selectedFont;
                  el.setAttribute('face', selectedFont);
               });
            }
         }
         syncActiveEditorContent();
      };
      
      const handleFontSizeChange = (selectedSize: string) => {
         restoreSelection();
         
         const selection = window.getSelection();
         if (!selection || selection.rangeCount === 0) return;
         const range = selection.getRangeAt(0);
         
         const isSlideActive = activeDocument?.type === 'slide' || activeDocument?.type === 'pptx' || activeDocument?.type === 'google_slide';
         const editor = isSlideActive ? slideContentRef.current : editorRef.current;
         if (!editor) return;
  
         if (range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = selectedSize + 'px';
            span.innerHTML = '&#8203;';
            range.insertNode(span);
            
            const newRange = document.createRange();
            if (span.firstChild) {
               newRange.setStart(span.firstChild, 1);
               newRange.setEnd(span.firstChild, 1);
               selection.removeAllRanges();
               selection.addRange(newRange);
               savedSelectionRef.current = newRange.cloneRange();
            }
         } else {
            const tempId = 'temp-size-' + Date.now();
            document.execCommand('fontName', false, tempId);
            const elements = editor.querySelectorAll('font[face="' + tempId + '"], span[style*="' + tempId + '"]');
            elements.forEach((el: any) => {
               if (el.tagName.toLowerCase() === 'font') {
                  el.removeAttribute('face');
               }
               el.style.fontSize = selectedSize + 'px';
            });
         }
         syncActiveEditorContent();
      };
      
      const alignText = (alignType: 'left' | 'center' | 'right') => {
        restoreSelection();
        const command = alignType === 'left' ? 'justifyLeft' : alignType === 'center' ? 'justifyCenter' : 'justifyRight';
        document.execCommand(command, false);
        syncActiveEditorContent();
     };

    const insertImage = () => {
       imageInputRef.current?.click();
    };

    const handleLocalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
             const base64Url = event.target?.result;
             if (base64Url && typeof base64Url === 'string') {
                restoreSelection();
                const imgHtml = `<div contenteditable="false" style="resize: both; overflow: hidden; display: inline-block; width: 300px; min-width: 50px; min-height: 50px; max-width: 100%; height: auto; margin: 1rem; position: relative;" class="border-2 border-dashed border-white/20 shadow-lg rounded-xl hover:border-primary/50 transition-colors" draggable="true"><img src="${base64Url}" alt="${file.name}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none;" /></div>`;
                document.execCommand('insertHTML', false, imgHtml);
                syncActiveEditorContent();
             }
          };
          reader.readAsDataURL(file);
       }
    };

    const insertTable = () => {
       restoreSelection();
       const tableHtml = `
          <div contenteditable="false" draggable="true" style="display: block; width: 100%; margin: 1.5rem 0; position: relative; padding: 1.5rem 0;" class="group cursor-move relative">
             <div class="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-8 bg-white/10 rounded cursor-move opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black transition-opacity" title="Drag to move table">⋮</div>
             <div contenteditable="true" style="resize: horizontal; overflow: auto; width: 100%; min-width: 200px; cursor: text;" class="border border-white/5 rounded-2xl p-2 bg-white/[0.01]">
                <table class="w-full border-collapse border border-white/10 text-slate-300">
                   <thead>
                      <tr class="bg-white/5">
                         <th class="border border-white/10 p-3 text-[10px] font-black uppercase text-primary">Column 1</th>
                         <th class="border border-white/10 p-3 text-[10px] font-black uppercase text-primary">Column 2</th>
                         <th class="border border-white/10 p-3 text-[10px] font-black uppercase text-primary">Column 3</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr>
                         <td class="border border-white/5 p-3 text-xs">Data Row 1</td>
                         <td class="border border-white/5 p-3 text-xs">Data Row 2</td>
                         <td class="border border-white/5 p-3 text-xs">Data Row 3</td>
                      </tr>
                      <tr>
                         <td class="border border-white/5 p-3 text-xs">Data Row 4</td>
                         <td class="border border-white/5 p-3 text-xs">Data Row 5</td>
                         <td class="border border-white/5 p-3 text-xs">Data Row 6</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       `;
       document.execCommand('insertHTML', false, tableHtml);
       syncActiveEditorContent();
    };
   const [showNewMenu, setShowNewMenu] = useState(false);
   const [showShareModal, setShowShareModal] = useState(false);
   const [showDownloadMenu, setShowDownloadMenu] = useState(false);
   const [sharedClients, setSharedClients] = useState<string[]>([]);
   const [pages, setPages] = useState([1]);
   const [isFullScreen, setIsFullScreen] = useState(false);
   const [showNewAssetModal, setShowNewAssetModal] = useState(false);
   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
   const [newAssetData, setNewAssetData] = useState({
      title: '',
      type: 'doc' as 'doc' | 'sheet' | 'slide',
      clientId: '',
      folderId: '' as string | null
   });

   React.useEffect(() => {
      if (clients.length > 0 && !newAssetData.clientId) {
         setNewAssetData(prev => ({ ...prev, clientId: clients[0].id }));
      }
   }, [clients, newAssetData.clientId]);

   const [folders, setFolders] = useState<any[]>([]);
   const [clientFolders, setClientFolders] = useState<any[]>([]);

   React.useEffect(() => {
      if (newAssetData.clientId) {
         vaultApi.getFolders({ client_id: newAssetData.clientId })
            .then(data => setClientFolders(data))
            .catch(err => console.error(err));
      } else {
         setClientFolders([]);
      }
   }, [newAssetData.clientId]);

   React.useEffect(() => {
      setFolders(storeFolders.map(f => ({ ...f, isOpen: false })));
   }, [storeFolders]);

    const handleSave = async () => {
       if (!activeDocument) return;
       setIsSaving(true);
       try {
          let finalContent = activeDocument.content || activeDocument.description || '';
          if ((activeDocument.type === 'doc' || activeDocument.type === 'docx') && editorRef.current) {
             finalContent = editorRef.current.innerHTML;
          } else if (activeDocument.type === 'slide' || activeDocument.type === 'pptx' || activeDocument.type === 'google_slide') {
             if (slideContentRef.current) {
                const slides = getSlides();
                if (slides[activeSlideIndex]) {
                   slides[activeSlideIndex].content = slideContentRef.current.innerHTML;
                }
                finalContent = JSON.stringify(slides);
             }
          }
          await updateDocumentMetadata(activeDocument.id, {
             title: activeDocument.title,
             description: finalContent,
             content: finalContent
          });
          // Update active document to reflect saved state
          setActiveDocument((prev: any) => prev ? { ...prev, content: finalContent, description: finalContent } : null);
       } catch (err) {
          console.error(err);
          alert('Failed to save. Please try again.');
       } finally {
          setIsSaving(false);
       }
    };

   const handleCreateAsset = async () => {
      if (!newAssetData.clientId) {
         alert("Please select a client.");
         return;
      }

      const docTypeMap = { doc: 'google_doc', sheet: 'google_sheet', slide: 'google_slide' };
      const assetTitle = newAssetData.title || `Untitled ${newAssetData.type}`;
      setIsSaving(true);
      try {
         // Store the title so we can auto-select it after the store updates
         pendingSelectRef.current = assetTitle;
         await createGoogleDoc(
            assetTitle,
            newAssetData.clientId,
            docTypeMap[newAssetData.type],
            newAssetData.folderId
         );
         setShowNewAssetModal(false);
         setNewAssetData({ title: '', type: 'doc', clientId: clients[0]?.id || '', folderId: null });
      } catch (err) {
         console.error(err);
         pendingSelectRef.current = null;
      } finally {
         setIsSaving(false);
      }
   };


   const createNewDocument = (type: 'doc' | 'sheet' | 'slide', folderId: string | null = null) => {
      setNewAssetData(prev => ({ ...prev, type, folderId }));
      setShowNewAssetModal(true);
      setShowNewMenu(false);
   };

   const createFolder = () => {
      const name = prompt("Enter folder name:", "New Folder");
      if (name) {
         storeCreateFolder(name, null);
      }
   };

   const toggleFolder = (id: string) => {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
   };

   const toggleShareClient = (name: string) => {
      setSharedClients(prev =>
         prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
      );
   };

   // Toolbar Component
   const renderToolbar = () => (
      <div className="h-12 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center px-4 gap-1 z-30 sticky top-0">
         <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
            <select
               id="toolbar-select-font"
               defaultValue="Inter"
               onChange={(e) => handleFontChange(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase focus:outline-none text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded"
            >
               <option className="bg-slate-900" value="Inter">Inter</option>
               <option className="bg-slate-900" value="Roboto">Roboto</option>
               <option className="bg-slate-900" value="Outfit">Outfit</option>
               <option className="bg-slate-900" value="Courier New">Mono</option>
            </select>
            <div className="h-4 w-px bg-white/10" />
            <select
               id="toolbar-select-size"
               defaultValue="14"
               onChange={(e) => handleFontSizeChange(e.target.value)}
               className="bg-transparent text-[10px] font-black uppercase focus:outline-none text-white cursor-pointer hover:bg-white/5 px-2 py-1 rounded w-12"
            >
               <option className="bg-slate-900" value="12">12</option>
               <option className="bg-slate-900" value="14">14</option>
               <option className="bg-slate-900" value="16">16</option>
               <option className="bg-slate-900" value="20">20</option>
               <option className="bg-slate-900" value="24">24</option>
               <option className="bg-slate-900" value="32">32</option>
            </select>
         </div>

         <div className="flex items-center gap-0.5 border-r border-white/10 pr-4 mr-2">
            <button
               id="toolbar-btn-bold"
               onClick={toggleBold}
               onMouseDown={(e) => e.preventDefault()}
               className="p-1.5 rounded-lg transition-all text-slate-400 hover:bg-white/5"
            >
               <Bold size={16} />
            </button>
            <button
               id="toolbar-btn-italic"
               onClick={toggleItalic}
               onMouseDown={(e) => e.preventDefault()}
               className="p-1.5 rounded-lg transition-all text-slate-400 hover:bg-white/5"
            >
               <Italic size={16} />
            </button>
            <button
               id="toolbar-btn-underline"
               onClick={toggleUnderline}
               onMouseDown={(e) => e.preventDefault()}
               className="p-1.5 rounded-lg transition-all text-slate-400 hover:bg-white/5"
            >
               <Underline size={16} />
            </button>
         </div>

         <div className="flex items-center gap-0.5 border-r border-white/10 pr-4 mr-2">
            <button onClick={() => alignText('left')} onMouseDown={(e) => e.preventDefault()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignLeft size={16} /></button>
            <button onClick={() => alignText('center')} onMouseDown={(e) => e.preventDefault()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignCenter size={16} /></button>
            <button onClick={() => alignText('right')} onMouseDown={(e) => e.preventDefault()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all"><AlignRight size={16} /></button>
         </div>

         <div className="flex items-center gap-0.5">
            <button onClick={insertImage} onMouseDown={(e) => e.preventDefault()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all flex items-center gap-2 pr-3">
               <ImageIcon size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
            </button>
            <button onClick={insertTable} onMouseDown={(e) => e.preventDefault()} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 transition-all flex items-center gap-2 pr-3">
               <TableIcon size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Table</span>
            </button>
         </div>

         <div className="flex-1" />

         <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isSaving ? 'bg-primary/30 border border-primary/40 text-primary/70 cursor-wait' : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'}`}
         >
            {isSaving ? (
               <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
               <><Save size={14} /> Save Changes</>
            )}
         </button>
      </div>
   );

   // Editor Components
   const renderDocEditor = () => (
      <div className="flex-1 bg-[#010409] p-12 overflow-y-auto scrollbar-hide flex flex-col items-center gap-12">
         <style>{`
            .rich-editor:empty:before {
               content: attr(placeholder);
               color: rgba(148, 163, 184, 0.3);
               cursor: text;
            }
            .rich-editor table {
               width: 100%;
               border-collapse: collapse;
               margin: 1.5rem 0;
               border: 1px solid rgba(255,255,255,0.1);
               color: #cbd5e1;
            }
            .rich-editor th {
               border: 1px solid rgba(255,255,255,0.1);
               padding: 0.75rem;
               background-color: rgba(255,255,255,0.05);
               font-size: 10px;
               font-weight: 900;
               text-transform: uppercase;
               color: #cdff00;
            }
            .rich-editor td {
               border: 1px solid rgba(255,255,255,0.05);
               padding: 0.75rem;
               font-size: 12px;
            }
            .rich-editor img {
               resize: both;
               overflow: hidden;
               display: inline-block;
               max-width: 100%;
               cursor: se-resize;
            }
         `}</style>
         {pages.map((pageNumber) => (
            <div
               key={pageNumber}
               className="w-full max-w-[850px] bg-white/[0.03] border border-white/5 shadow-2xl min-h-[1100px] p-24 relative flex-shrink-0 transition-all hover:bg-white/[0.04]"
               style={{ fontFamily: 'Inter' }}
            >
               {pageNumber === 1 && (
                  <div className="space-y-8">
                     <input
                        type="text"
                        value={activeDocument?.title}
                        onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, title: e.target.value } : null)}
                        className="w-full bg-transparent border-none focus:outline-none text-4xl uppercase italic tracking-tighter text-white font-black"
                        style={{ fontSize: `36px` }}
                        placeholder="Document Title"
                     />
                     <div className="h-px bg-white/10 w-full" />
                  </div>
               )}
               <div className="relative mt-8">
                  {pageNumber === 1 ? (
                     <div
                        key={activeDocument?.id}
                        ref={editorRef}
                        dangerouslySetInnerHTML={{ __html: activeDocument?.content || '' }}
                        contentEditable
                        onInput={handleEditorInput}
                        onBlur={handleEditorBlur}

                        suppressContentEditableWarning
                        className="rich-editor w-full bg-transparent border-none focus:outline-none min-h-[500px] leading-relaxed text-slate-300 focus:text-white"
                        style={{
                           fontFamily: 'Inter',
                           fontSize: '14px',
                        }}
                        {...{ placeholder: "Start typing your document repository layer..." }}
                        spellCheck={false}
                     />
                  ) : (
                     <div
                        className="w-full bg-transparent border-none focus:outline-none min-h-[500px] leading-relaxed text-slate-600 italic select-none"
                        style={{
                           fontFamily: 'Inter',
                           fontSize: '14px',
                        }}
                     >
                        Multi-page workspace active. Please type on Page 1 to start drafting your content layers.
                     </div>
                  )}
               </div>

               {pageNumber === pages.length && (
                  <div className="grid grid-cols-2 gap-8 my-12 pointer-events-none border-t border-white/5 pt-12 relative z-0">
                     <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-slate-600 italic text-[10px] font-black uppercase tracking-widest">
                        Document Image Overlay Placeholder
                     </div>
                     <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center text-slate-600 italic text-[10px] font-black uppercase tracking-widest">
                        Asset Reference View
                     </div>
                  </div>
               )}
               <div className="absolute bottom-8 right-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Page {pageNumber} of {pages.length}
               </div>
            </div>
         ))}

         <button
            onClick={() => setPages(prev => [...prev, prev.length + 1])}
            className="group flex flex-col items-center gap-4 py-12"
         >
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
               <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-primary transition-colors">Append Next Architecture Page</span>
         </button>
      </div>
   );

   const renderSheetEditor = () => {
      const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const rowCount = 25;

      // Parse cell data from content (JSON) or initialize empty
      const getCellData = (): Record<string, string> => {
         try {
            if (activeDocument?.content && activeDocument.content.startsWith('{')) {
               return JSON.parse(activeDocument.content);
            }
         } catch {}
         return {};
      };

      const updateCell = (key: string, value: string) => {
         const data = getCellData();
         data[key] = value;
         setActiveDocument((prev: any) => prev ? { ...prev, content: JSON.stringify(data) } : null);
      };

      const cellData = getCellData();

      return (
      <div className="flex-1 bg-[#010409] overflow-hidden flex flex-col">
         <div className="p-4 border-b border-white/5 bg-white/5">
            <input
               type="text"
               value={activeDocument?.title}
               onChange={(e) => setActiveDocument((prev: any) => prev ? { ...prev, title: e.target.value } : null)}
               className="bg-transparent border-none focus:outline-none text-xl font-black uppercase italic tracking-tighter text-white w-full"
               placeholder="Sheet Title"
            />
         </div>
         <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
            <div className="w-10 h-6 bg-primary/10 border border-primary/20 rounded flex items-center justify-center text-[10px] font-black text-primary uppercase">fx</div>
            <input type="text" className="bg-transparent flex-1 text-[11px] font-bold text-white focus:outline-none" placeholder="Select a cell to edit..." readOnly />
         </div>
         <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
               <thead>
                  <tr>
                     <th className="w-10 bg-white/5 border border-white/10 text-[9px] font-black text-slate-600"></th>
                     {cols.map(col => (
                        <th key={col} className="bg-white/5 border border-white/10 p-2 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">{col}</th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {Array.from({ length: rowCount }, (_, i) => i + 1).map(row => (
                     <tr key={row}>
                        <td className="bg-white/5 border border-white/10 text-center text-[9px] font-black text-slate-600">{row}</td>
                        {cols.map(col => {
                           const cellKey = `${col}${row}`;
                           return (
                              <td key={col} className="border border-white/5 p-0 min-w-[120px] hover:bg-primary/5 transition-colors cursor-cell group">
                                 <input
                                    type="text"
                                    className="bg-transparent w-full text-xs font-medium text-slate-400 group-hover:text-white focus:outline-none focus:bg-white/5 px-3 py-3"
                                    value={cellData[cellKey] || ''}
                                    onChange={(e) => updateCell(cellKey, e.target.value)}
                                    placeholder={row === 1 ? `Header ${col}` : ''}
                                 />
                              </td>
                           );
                        })}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
   };

   const renderSlideEditor = () => {
      const slides = getSlides();
      const currentSlide = slides[activeSlideIndex] || slides[0] || { title: '', subtitle: '', content: '' };

      return (
         <div className="flex-1 flex overflow-hidden bg-[#010409]">
            <style>{`
               .slide-workspace-editor:empty:before {
                  content: attr(placeholder);
                  color: rgba(148, 163, 184, 0.3);
                  cursor: text;
               }
               .slide-workspace-editor img {
                  resize: both;
                  overflow: hidden;
                  display: inline-block;
                  max-width: 100%;
                  cursor: se-resize;
               }
            `}</style>
            <div className="w-56 border-r border-white/5 bg-white/[0.02] overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 px-1">Slide Deck Overview</div>
                  {slides.map((slide, idx) => (
                     <div
                        key={slide.id}
                        onClick={() => {
                            saveCurrentSlideDOMToState();
                            setActiveSlideIndex(idx);
                         }}
                        className={`aspect-video rounded-2xl border-2 transition-all cursor-pointer hover:border-primary/50 group relative overflow-hidden ${idx === activeSlideIndex ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(205,255,0,0.05)]' : 'border-white/10 bg-white/5'}`}
                     >
                        <div className="absolute top-2 left-2 text-[9px] font-black text-slate-500">{idx + 1}</div>
                        <button
                           onClick={(e) => deleteSlide(idx, e)}
                           className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                           title="Delete Slide"
                        >
                           <X size={10} />
                        </button>
                        <div className="w-full h-full rounded-lg flex flex-col items-start justify-center p-4 pt-6">
                           <div className="text-[9px] font-black uppercase text-white truncate w-full">{slide.title || 'Untitled Slide'}</div>
                           <div className="text-[7px] font-bold text-slate-500 uppercase tracking-widest truncate w-full mt-1">{slide.subtitle || 'Subtitle'}</div>
                        </div>
                     </div>
                  ))}
               </div>
               <button
                  onClick={addSlide}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all mt-4"
               >
                  <PlusCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Slide</span>
               </button>
            </div>

            <div className="flex-1 p-12 overflow-y-auto flex items-center justify-center">
               <div className="w-full max-w-4xl aspect-video bg-white/[0.03] border border-white/5 rounded-[40px] shadow-2xl p-16 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                  
                  <div className="space-y-4 relative z-10">
                     <input
                        type="text"
                        value={currentSlide.title || ''}
                        onChange={(e) => updateSlideTitle(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-4xl font-black italic uppercase tracking-tighter text-white"
                        placeholder="Slide Title"
                     />
                     <input
                        type="text"
                        value={currentSlide.subtitle || ''}
                        onChange={(e) => updateSlideSubtitle(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-md text-primary font-bold uppercase tracking-widest"
                        placeholder="Add Subtitle Layer..."
                     />
                     <div className="h-0.5 w-24 bg-white/10 rounded-full" />
                  </div>

                  <div className="flex-1 my-6 relative z-10 overflow-y-auto pr-2 scrollbar-hide">
                     <div
                        key={`${activeDocument?.id}-${activeSlideIndex}`}
                        ref={slideContentRef}
                        dangerouslySetInnerHTML={{ __html: currentSlide.content || '' }}
                        contentEditable
                        onBlur={handleSlideContentBlur}
                        suppressContentEditableWarning
                        className="slide-workspace-editor w-full min-h-[100px] bg-transparent border-none focus:outline-none text-lg text-slate-300 focus:text-white leading-relaxed"
                        {...{ placeholder: "Start typing slide infrastructure content..." }}
                        style={{ fontFamily: 'Inter' }}
                     />
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                     <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">ORR Solutions Portfolio • 2024</p>
                     <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                        Slide {activeSlideIndex + 1} of {slides.length}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };

   const ShareModal = () => (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      >
         <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
         >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Share Asset</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage Workspace Access</p>
               </div>
               <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-all">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-6">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                     type="text"
                     placeholder="Search clients or stakeholders..."
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all"
                  />
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Available Clients</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                     {clients.map(client => (
                        <div key={client.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                 {client.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-xs font-black uppercase tracking-tight">{client.name}</p>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{client.company}</p>
                              </div>
                           </div>
                           <button
                              onClick={() => toggleShareClient(client.name)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${sharedClients.includes(client.name)
                                 ? 'bg-primary text-slate-900 border-primary'
                                 : 'bg-white/5 text-slate-400 border-white/10 hover:border-primary/50'
                                 }`}
                           >
                              {sharedClients.includes(client.name) ? 'Revoke' : 'Grant Access'}
                           </button>
                        </div>
                     ))}
                  </div>
               </div>

               {sharedClients.length > 0 && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">Active Access List</p>
                     <div className="flex flex-wrap gap-2">
                        {sharedClients.map(name => (
                           <div key={name} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black uppercase text-white flex items-center gap-2">
                              {name}
                              <button onClick={() => toggleShareClient(name)}><X size={10} /></button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
               <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-4 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-lemon transition-all"
               >
                  Update Permissions
               </button>
            </div>
         </motion.div>
      </motion.div>
   );

   const DownloadMenu = () => (
      <motion.div
         initial={{ opacity: 0, y: 10, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         className="absolute right-0 top-full mt-4 w-64 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]"
      >
         <div className="p-4 border-b border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Export Formats</p>
         </div>
         <div className="p-2">
            {[
               { icon: FileText, label: 'Portable Document (PDF)', ext: '.pdf' },
               { icon: FileCode, label: 'Microsoft Word (DOCX)', ext: '.docx' },
               { icon: FileSpreadsheet, label: 'Microsoft Excel (XLSX)', ext: '.xlsx' },
               { icon: PlaySquare, label: 'Presentation (PPTX)', ext: '.pptx' },
               { icon: Globe, label: 'Web Page (HTML)', ext: '.html' }
            ].map((item, idx) => (
               <button
                  key={idx}
                  className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl text-left transition-all group"
                  onClick={() => setShowDownloadMenu(false)}
               >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all">
                     <item.icon size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-tight text-slate-300 group-hover:text-white">{item.label}</p>
                     <p className="text-[8px] font-bold text-slate-600 uppercase group-hover:text-primary/70">Export as {item.ext}</p>
                  </div>
               </button>
            ))}
         </div>
      </motion.div>
   );

   return (
      <div className="h-screen bg-card text-white flex flex-col relative overflow-hidden">
         {/* Background Glows */}
         <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
         </div>

         {/* Header */}
         {!isFullScreen && (
            <header className="h-20 border-b border-white/5 backdrop-blur-xl bg-white/5 flex items-center justify-between px-8 z-20">
               <div className="flex items-center gap-6">
                  <Link href="/document-vault/all" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-slate-400">
                     <ChevronLeft size={20} />
                  </Link>
                  <div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Sparkles size={12} /> Creation Studio
                     </div>
                     <h1 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                        {activeDocument ? activeDocument.title : 'Initialize Workspace'}
                        {activeDocument?.link && (
                           <a
                              href={activeDocument.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-primary/20 hover:bg-primary/40 rounded-lg text-primary transition-all flex items-center gap-2"
                              title="Open in Google Drive"
                           >
                              <ExternalLink size={14} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Live Editor</span>
                           </a>
                        )}
                     </h1>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  {activeDocument && (
                     <>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                           <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {isSaving ? 'Synchronizing...' : 'All Changes Synced'}
                           </span>
                        </div>
                     </>
                  )}
                  <button
                     onClick={() => setShowShareModal(true)}
                     className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-slate-400 flex items-center gap-2"
                  >
                     <Share2 size={20} />
                     {sharedClients.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-slate-900 text-[10px] font-black flex items-center justify-center">
                           {sharedClients.length}
                        </span>
                     )}
                  </button>
                  <div className="relative">
                     <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className={`p-3 rounded-2xl border transition-all ${showDownloadMenu ? 'bg-primary text-slate-900 border-primary shadow-[0_0_15px_rgba(205,255,0,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                     >
                        <Download size={20} />
                     </button>
                     <AnimatePresence>
                        {showDownloadMenu && <DownloadMenu />}
                     </AnimatePresence>
                  </div>
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-slate-400">
                     <MoreVertical size={20} />
                  </button>
               </div>
            </header>
         )}

         {/* Main Workspace */}
         <main className="flex-1 flex overflow-hidden">
            {/* Sidebar: Projects & Drafts */}
            {!isFullScreen && (
               <aside className="w-80 border-r border-white/5 bg-white/[0.02] flex flex-col z-10">
                  <div className="p-6 relative">
                     <button
                        onClick={() => setShowNewMenu(!showNewMenu)}
                        className="w-full py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all group text-primary"
                     >
                        <Plus size={18} className={`transition-transform duration-300 ${showNewMenu ? 'rotate-45' : ''}`} />
                        New Repository Asset
                     </button>

                     <AnimatePresence>
                        {showNewMenu && (
                           <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-6 right-6 mt-4 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                           >
                              <div className="p-2">
                                 {[
                                    { icon: FileText, label: 'Google Docs', type: 'doc', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                                    { icon: Grid3X3, label: 'Google Sheets', type: 'sheet', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                                    { icon: Presentation, label: 'Google Slides', type: 'slide', color: 'text-amber-400', bg: 'bg-amber-400/10' }
                                 ].map((item) => (
                                    <button
                                       key={item.type}
                                       onClick={() => createNewDocument(item.type as any)}
                                       className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-xl transition-all group"
                                    >
                                       <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                          <item.icon size={20} />
                                       </div>
                                       <div className="text-left">
                                          <p className="text-[11px] font-black uppercase tracking-tight text-white">{item.label}</p>
                                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Create New Session</p>
                                       </div>
                                    </button>
                                 ))}
                              </div>
                              <div className="p-4 bg-white/5 border-t border-white/5">
                                 <button className="w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                                    <PlusCircle size={12} /> More Assets
                                 </button>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
                     <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Repository Structure</h3>
                        <button
                           onClick={createFolder}
                           className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-primary transition-all"
                           title="Create New Folder"
                        >
                           <FolderPlus size={14} />
                        </button>
                     </div>

                     <div className="space-y-4">
                        {/* Folders */}
                        {isLoading ? (
                           Array.from({ length: 4 }).map((_, idx) => (
                              <div key={idx} className="animate-pulse flex items-center gap-2 p-2">
                                 <div className="w-4 h-4 bg-white/10 rounded" />
                                 <div className="w-4 h-4 bg-white/10 rounded" />
                                 <div className="h-3 bg-white/10 rounded w-24" />
                              </div>
                           ))
                        ) : (
                           folders.map(folder => (
                              <div key={folder.id} className="space-y-1">
                                 <button
                                    onClick={() => toggleFolder(folder.id)}
                                    className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
                                 >
                                    {folder.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    <Folder size={16} className={folder.isOpen ? 'text-primary' : 'text-slate-600'} />
                                    <span className="text-[11px] font-black uppercase tracking-tight flex-1 text-left">{folder.name}</span>
                                    <span className="text-[9px] font-bold text-slate-700">{drafts.filter(d => d.folderId?.toString() === folder.id.toString()).length}</span>
                                 </button>

                                 {folder.isOpen && (
                                    <div className="ml-4 pl-4 border-l border-white/5 space-y-2 py-1">
                                       {drafts.filter(d => d.folderId?.toString() === folder.id.toString()).map(draft => (
                                          <button
                                             key={draft.id}
                                             onClick={() => setActiveDocument({ ...draft, content: (draft as any).description || (draft as any).content || '' } as any)}
                                             className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all border ${activeDocument?.id === draft.id
                                                ? 'bg-primary/10 border-primary/20 text-white shadow-[0_0_20px_rgba(205,255,0,0.05)]'
                                                : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                                }`}
                                          >
                                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${((draft as any).type === 'docx' || (draft as any).type === 'doc' || (draft as any).type === 'google_doc') ? 'bg-blue-500/20 text-blue-400' : ((draft as any).type === 'xlsx' || (draft as any).type === 'sheet' || (draft as any).type === 'google_sheet') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {((draft as any).type === 'docx' || (draft as any).type === 'doc' || (draft as any).type === 'google_doc') ? <FileText size={16} /> : ((draft as any).type === 'xlsx' || (draft as any).type === 'sheet' || (draft as any).type === 'google_sheet') ? <Grid3X3 size={16} /> : <Presentation size={16} />}
                                             </div>
                                             <div className="text-left flex-1 min-w-0">
                                                <p className="text-[11px] font-black uppercase truncate tracking-tight">{draft.title}</p>
                                             </div>
                                          </button>
                                       ))}
                                       {drafts.filter(d => d.folderId?.toString() === folder.id.toString()).length === 0 && (
                                          <p className="text-[9px] text-slate-700 italic py-2">No assets in this container.</p>
                                       )}
                                    </div>
                                 )}
                              </div>
                           ))
                        )}

                        {/* Uncategorized */}
                        <div className="space-y-1 mt-6">
                           <div className="flex items-center gap-2 p-2 text-slate-600 mb-2">
                              <Layers size={14} />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Uncategorized Assets</span>
                           </div>
                           <div className="space-y-2">                                    {drafts.filter(d => !d.folderId).map(draft => (
                              <button
                                 key={draft.id}
                                 onClick={() => setActiveDocument({ ...draft, content: (draft as any).description || (draft as any).content || '' } as any)}
                                 className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${activeDocument?.id === draft.id
                                    ? 'bg-primary/10 border-primary/30 text-white shadow-[0_0_20px_rgba(205,255,0,0.05)]'
                                    : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                                    }`}
                              >
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${((draft as any).type === 'docx' || (draft as any).type === 'doc' || (draft as any).type === 'google_doc') ? 'bg-blue-500/20 text-blue-400' : ((draft as any).type === 'xlsx' || (draft as any).type === 'sheet' || (draft as any).type === 'google_sheet') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {((draft as any).type === 'docx' || (draft as any).type === 'doc' || (draft as any).type === 'google_doc') ? <FileText size={20} /> : ((draft as any).type === 'xlsx' || (draft as any).type === 'sheet' || (draft as any).type === 'google_sheet') ? <Grid3X3 size={20} /> : <Presentation size={20} />}
                                 </div>
                                 <div className="text-left flex-1 min-w-0">
                                    <p className={`text-sm font-black uppercase truncate ${activeDocument?.id === draft.id ? 'text-white' : 'text-slate-300'}`}>
                                       {draft.title}
                                    </p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-0.5">
                                       {(draft as any).updatedAt || (draft as any).lastEdited}
                                    </p>
                                 </div>
                              </button>
                           ))}

                           </div>
                        </div>
                     </div>
                  </div>
               </aside>
            )}

            {/* Editor Area */}
            <div className="flex-1 relative flex flex-col">
               <AnimatePresence mode="wait">
                  {activeDocument ? (
                     <motion.div
                        key={activeDocument.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                     >
                        {renderToolbar()}
                        {(activeDocument.link || activeDocument.webViewLink) && !isMock ? (
                           <div className="flex-1 bg-[#010409] flex flex-col">
                              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activeDocument.type === 'pdf' ? 'bg-red-500' : (activeDocument.type === 'docx' || activeDocument.type === 'xlsx' || activeDocument.type === 'pptx') ? 'bg-blue-400' : 'bg-primary'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                       {activeDocument.type === 'pdf' ? 'PDF Asset View' : (activeDocument.documentSource?.startsWith('google_')) ? 'Live Infrastructure Sync' : 'Office Asset Preview'}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Collaborative Mode Active</span>
                                    <a
                                       href={activeDocument.link || activeDocument.webViewLink}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-lemon transition-colors"
                                    >
                                       Open Full Suite
                                    </a>
                                 </div>
                              </div>
                              <iframe
                                 src={(() => {
                                    const link = activeDocument.link || activeDocument.webViewLink;
                                    const isGoogleNative = activeDocument.documentSource?.startsWith('google_') || link.includes('docs.google.com');

                                    // If it's a PDF, always use the link directly
                                    if (activeDocument.type === 'pdf') return link;

                                    // If it's a Google Native doc (doc, sheet, slide), use the link directly 
                                    // (backend already formats it as /edit?rm=minimal)
                                    if (isGoogleNative) return link;

                                    // If it's an uploaded Office file, use the Google Viewer
                                    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(activeDocument.type)) {
                                       return `https://docs.google.com/viewer?url=${encodeURIComponent(link)}&embedded=true`;
                                    }

                                    return link;
                                 })()}
                                 className="flex-1 w-full border-none bg-white"
                                 title={activeDocument.title}
                              />
                           </div>
                        ) : (activeDocument.type === 'doc' || activeDocument.type === 'docx') ? (
                           renderDocEditor()
                        ) : (activeDocument.type === 'sheet' || activeDocument.type === 'xlsx') ? (
                           renderSheetEditor()
                        ) : (activeDocument.type === 'slide' || activeDocument.type === 'pptx') ? (
                           renderSlideEditor()
                        ) : (
                           <div className="flex-1 bg-[#010409] p-12 overflow-y-auto flex flex-col items-center justify-center">
                              <div className="w-full max-w-4xl bg-white/[0.03] border border-white/5 rounded-[40px] shadow-2xl p-16 flex flex-col items-center gap-8 text-center">
                                 <Loader2 size={40} className="text-primary animate-spin" />
                                 <div className="space-y-4">
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Initializing Editor</h2>
                                    <p className="text-slate-500 max-w-md mx-auto">Connecting to infrastructure layer... If this persists, please re-upload the asset.</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </motion.div>
                  ) : (
                     <div className="flex-1 flex items-center justify-center bg-[#010409]">
                        <div className="text-center space-y-6 max-w-sm">
                           <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-slate-700 mx-auto">
                              <Layers size={48} className="opacity-20" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-2xl font-black text-white uppercase italic">Studio Workspace</h3>
                              <p className="text-slate-500 text-sm font-medium">Select a drafting session to initialize the document architecture suite.</p>
                           </div>
                        </div>
                     </div>
                  )}
               </AnimatePresence>

               {/* Editor Footer Tools */}
               <div className="h-12 border-t border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between px-8 text-slate-500">
                  <div className="flex items-center gap-8">
                     <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`flex items-center gap-2 transition-colors ${isFullScreen ? 'text-primary' : 'hover:text-white'}`}
                     >
                        <Maximize2 size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{isFullScreen ? 'Exit Full Screen' : 'Focus Mode'}</span>
                     </button>
                     <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <History size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Timeline</span>
                     </button>
                  </div>
                  <div className="flex items-center gap-6">
                     <p className="text-[9px] font-black uppercase tracking-widest">Drafting Infrastructure v0.4</p>
                  </div>
               </div>
            </div>

            {/* Right Panel: Intelligence */}
            {!isFullScreen && (
               <aside className="w-96 border-l border-white/5 bg-white/[0.02] flex flex-col z-10">
                  <div className="p-6 border-b border-white/5 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Zap size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tighter">Gemini Suite</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Drafting Agent</p>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 space-y-4">
                        <p className="text-xs text-white leading-relaxed font-medium">
                           "I can help you structure the data in {activeDocument?.title || 'this asset'}. Should I suggest an architectural outline?"
                        </p>
                        <button className="w-full py-2 bg-primary text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-lemon transition-all">Generate Outline</button>
                     </div>
                  </div>

                  <div className="p-6 border-t border-white/5">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Ask Gemini..."
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-slate-900 rounded-xl">
                           <ArrowRight size={14} />
                        </button>
                     </div>
                  </div>
               </aside>
            )}
         </main>

         {/* Modals */}
         <AnimatePresence>
            {showShareModal && <ShareModal />}
            {showNewAssetModal && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
               >
                  <motion.div
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     className="w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
                  >
                     <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div>
                           <h3 className="text-2xl font-black uppercase italic tracking-tighter">New Repository Asset</h3>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Initialize Professional Infrastructure</p>
                        </div>
                        <button onClick={() => setShowNewAssetModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-all border border-white/5">
                           <X size={24} />
                        </button>
                     </div>

                     <div className="p-8 space-y-8">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Asset Title</p>
                           <input
                              type="text"
                              value={newAssetData.title}
                              onChange={(e) => setNewAssetData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Q4 Financial Architecture"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 text-white"
                           />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                           {[
                              { type: 'doc', icon: FileText, label: 'Document', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                              { type: 'sheet', icon: Grid3X3, label: 'Spreadsheet', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                              { type: 'slide', icon: Presentation, label: 'Presentation', color: 'text-amber-400', bg: 'bg-amber-400/10' }
                           ].map((item) => (
                              <button
                                 key={item.type}
                                 onClick={() => setNewAssetData(prev => ({ ...prev, type: item.type as any }))}
                                 className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${newAssetData.type === item.type ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(205,255,0,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                    <item.icon size={24} />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                              </button>
                           ))}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Target Client</p>
                              <div className="relative">
                                 <select
                                    value={newAssetData.clientId}
                                    onChange={(e) => setNewAssetData(prev => ({ ...prev, clientId: e.target.value, folderId: null }))}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer text-white"
                                 >
                                    {clients.map(c => (
                                       <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                    ))}
                                 </select>
                                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                              </div>
                           </div>

                           <div className="space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Repository Folder</p>
                              <div className="relative">
                                 <select
                                    value={newAssetData.folderId || ''}
                                    onChange={(e) => setNewAssetData(prev => ({ ...prev, folderId: e.target.value || null }))}
                                    className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer text-white"
                                 >
                                    <option value="" className="bg-slate-900 italic">Root Directory</option>
                                    {clientFolders.map(f => (
                                       <option key={f.id} value={f.id} className="bg-slate-900">{f.name}</option>
                                    ))}
                                 </select>
                                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-3xl border border-white/5">
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Want to upload an existing file instead?</p>
                           <button
                              onClick={() => { setShowNewAssetModal(false); setIsUploadModalOpen(true); }}
                              className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
                           >
                              Click here
                           </button>
                        </div>
                     </div>

                     <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                        <button
                           onClick={() => setShowNewAssetModal(false)}
                           className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-slate-400"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleCreateAsset}
                           disabled={isSaving}
                           className="flex-[2] py-5 bg-primary text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-lemon transition-all shadow-[0_0_30px_rgba(205,255,0,0.2)] disabled:opacity-50 disabled:cursor-wait"
                        >
                           {isSaving ? 'Initializing Architecture...' : 'Generate Repository Asset'}
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
         <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
         <input
            type="file"
            ref={imageInputRef}
            onChange={handleLocalImageChange}
            accept="image/*"
            className="hidden"
         />
      </div>
   );
}
