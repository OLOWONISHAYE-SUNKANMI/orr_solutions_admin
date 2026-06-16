"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { motion, AnimatePresence } from 'framer-motion';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Strike } from '@tiptap/extension-strike';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { FontFamily } from '@tiptap/extension-font-family';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Highlighter, Link as LinkIcon, RemoveFormatting, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Table as TableIcon, List, ListOrdered, CheckSquare, ChevronDown, Plus, Minus, Type, X } from 'lucide-react';

const LineHeight = Extension.create({
   name: 'lineHeight',
   addOptions() {
      return {
         types: ['paragraph', 'heading'],
         defaultLineHeight: 'normal',
      };
   },
   addGlobalAttributes() {
      return [
         {
            types: this.options.types,
            attributes: {
               lineHeight: {
                  default: this.options.defaultLineHeight,
                  parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                  renderHTML: attributes => {
                     if (attributes.lineHeight === this.options.defaultLineHeight) return {};
                     return { style: `line-height: ${attributes.lineHeight}` };
                  },
               },
            },
         },
      ];
   },
   addCommands() {
      return {
         setLineHeight: (lineHeight: string) => ({ commands }) => {
            return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
         },
         unsetLineHeight: () => ({ commands }) => {
            return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'));
         },
      };
   },
});

interface DocsEditorProps {
   content: string;
   onChange: (content: string) => void;
   title: string;
   onTitleChange: (title: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
   const [showInsertMenu, setShowInsertMenu] = useState(false);
   const [promptState, setPromptState] = useState<{
      isOpen: boolean;
      title: string;
      placeholder: string;
      initialValue: string;
      onSubmit: (val: string) => void;
   }>({ isOpen: false, title: '', placeholder: '', initialValue: '', onSubmit: () => {} });
   const insertMenuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (insertMenuRef.current && !insertMenuRef.current.contains(event.target as Node)) {
            setShowInsertMenu(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   if (!editor) {
      return null;
   }

   const openPrompt = useCallback((title: string, placeholder: string, initialValue: string, onSubmit: (val: string) => void) => {
      setPromptState({ 
         isOpen: true, 
         title, 
         placeholder, 
         initialValue, 
         onSubmit: (val) => {
            onSubmit(val);
            setPromptState(prev => ({ ...prev, isOpen: false }));
         }
      });
   }, []);

   // Expose prompt state globally for the event listener
   useEffect(() => {
      (window as any).__openDocsPrompt = openPrompt;
      return () => { delete (window as any).__openDocsPrompt; };
   }, [openPrompt]);

   return (
      <>
      <div className="h-10 border-b border-gray-200 bg-white flex items-center px-4 gap-1 z-30 sticky top-0 shrink-0 shadow-sm overflow-x-auto scrollbar-hide whitespace-nowrap w-full">
         <div className="flex items-center gap-2 border-r border-gray-300 pr-3 mr-2 shrink-0">
            <select
               value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
               onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
               className="bg-transparent text-xs font-medium focus:outline-none text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded max-w-[120px] truncate"
               title="Font"
            >
               <option value="Inter">Inter</option>
               <option value="Arial">Arial</option>
               <option value="Roboto">Roboto</option>
               <option value="Times New Roman">Times New Roman</option>
               <option value="Courier New">Courier New</option>
               <option value="Georgia">Georgia</option>
               <option value="Verdana">Verdana</option>
               <option value="Tahoma">Tahoma</option>
               <option value="Trebuchet MS">Trebuchet MS</option>
               <option value="Impact">Impact</option>
               <option value="Comic Sans MS">Comic Sans MS</option>
               <option value="Garamond">Garamond</option>
               <option value="Palatino">Palatino</option>
               <option value="Helvetica">Helvetica</option>
               <option value="Oswald">Oswald</option>
               <option value="Raleway">Raleway</option>
               <option value="Montserrat">Montserrat</option>
               <option value="Merriweather">Merriweather</option>
               <option value="Open Sans">Open Sans</option>
               <option value="Lato">Lato</option>
               <option value="Ubuntu">Ubuntu</option>
               <option value="Playfair Display">Playfair Display</option>
            </select>
            <div className="h-4 w-px bg-gray-300" />
            <select className="bg-transparent text-xs font-medium focus:outline-none text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded w-14">
               <option>11</option>
               <option>12</option>
               <option>14</option>
               <option>16</option>
               <option>24</option>
               <option>32</option>
            </select>
         </div>

         <div className="flex items-center gap-0.5 border-r border-gray-300 pr-3 mr-2">
            <button
               onClick={() => editor.chain().focus().toggleBold().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('bold') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Bold (Cmd+B)"
            >
               <Bold size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleItalic().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('italic') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Italic (Cmd+I)"
            >
               <Italic size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleUnderline().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('underline') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Underline (Cmd+U)"
            >
               <UnderlineIcon size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleStrike().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('strike') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Strikethrough"
            >
               <Strikethrough size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleSuperscript().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('superscript') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Superscript"
            >
               <SuperscriptIcon size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleSubscript().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('subscript') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Subscript"
            >
               <SubscriptIcon size={16} />
            </button>
            <div className="flex items-center gap-1 mx-1">
               <button
                  onClick={() => {
                     openPrompt('Text Color', 'Enter color hex (e.g. #ff0000)', editor.getAttributes('textStyle').color || '#000000', (color) => {
                        editor.chain().focus().setColor(color).run();
                        setPromptState(prev => ({ ...prev, isOpen: false }));
                     });
                  }}
                  className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-0.5"
                  title="Text color"
               >
                  <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
                  <ChevronDown size={12} />
               </button>
               <button
                  onClick={() => {
                     openPrompt('Highlight Color', 'Enter highlight color hex (e.g. #ffff00) or leave blank to clear', '', (color) => {
                        if (color) editor.chain().focus().toggleHighlight({ color }).run();
                        else editor.chain().focus().unsetHighlight().run();
                        setPromptState(prev => ({ ...prev, isOpen: false }));
                     });
                  }}
                  className={`p-1.5 rounded transition-all flex items-center gap-0.5 ${editor.isActive('highlight') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Highlight color"
               >
                  <Highlighter size={16} />
                  <ChevronDown size={12} />
               </button>
            </div>
            <button
               onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
               className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-all"
               title="Clear formatting"
            >
               <RemoveFormatting size={16} />
            </button>
         </div>

         <div className="flex items-center gap-0.5 border-r border-gray-300 pr-3 mr-2">
            <button
               onClick={() => editor.chain().focus().setTextAlign('left').run()}
               className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Align left"
            >
               <AlignLeft size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('center').run()}
               className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Align center"
            >
               <AlignCenter size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('right').run()}
               className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Align right"
            >
               <AlignRight size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('justify').run()}
               className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
               title="Justify"
            >
               <AlignJustify size={16} />
            </button>
            
            <div className="h-4 w-px bg-gray-300 mx-1" />

            <select 
               onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
               className="bg-transparent text-xs font-medium focus:outline-none text-gray-700 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded w-16"
               title="Line spacing"
            >
               <option value="normal">Auto</option>
               <option value="1.15">1.15</option>
               <option value="1.5">1.5</option>
               <option value="2">Double</option>
            </select>
         </div>

         <div className="flex items-center gap-0.5 border-r border-gray-300 pr-3 mr-2">
            <button
               onClick={() => editor.chain().focus().toggleBulletList().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('bulletList') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               <List size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleOrderedList().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('orderedList') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               <ListOrdered size={16} />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleTaskList().run()}
               className={`p-1.5 rounded transition-all ${editor.isActive('taskList') ? 'bg-[#c2e7ff] text-[#001d35]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               <CheckSquare size={16} />
            </button>
         </div>

         <div className="relative" ref={insertMenuRef}>
            <button
               onClick={() => setShowInsertMenu(!showInsertMenu)}
               className="p-1.5 rounded text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-1"
               title="Insert"
            >
               <Plus size={16} />
               <ChevronDown size={12} />
            </button>

            <AnimatePresence>
               {showInsertMenu && (
                  <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 5 }}
                     className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-50 text-sm"
                  >
                     <button
                        onClick={() => {
                           setShowInsertMenu(false);
                           openPrompt('Insert Link', 'URL to link (e.g. https://google.com)', '', (url) => {
                              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                              setPromptState(prev => ({ ...prev, isOpen: false }));
                           });
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                     >
                        <LinkIcon size={14} className="text-gray-500" /> Link
                     </button>
                     <button
                        onClick={() => {
                           setShowInsertMenu(false);
                           openPrompt('Insert Image', 'Image URL (e.g. https://example.com/image.png)', '', (url) => {
                              editor.chain().focus().setImage({ src: url }).run();
                              setPromptState(prev => ({ ...prev, isOpen: false }));
                           });
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                     >
                        <ImageIcon size={14} className="text-gray-500" /> Image
                     </button>
                     <button
                        onClick={() => {
                           editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                           setShowInsertMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                     >
                        <TableIcon size={14} className="text-gray-500" /> Table
                     </button>
                     <button
                        onClick={() => {
                           editor.chain().focus().setHorizontalRule().run();
                           setShowInsertMenu(false);
                        }}
                        className="w-full px-4 py-2 flex items-center gap-3 text-gray-700 hover:bg-gray-100"
                     >
                        <Minus size={14} className="text-gray-500" /> Horizontal Rule
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      <AnimatePresence>
         {promptState.isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            >
               <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-md bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
               >
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                     <h2 className="text-xl font-bold text-white">{promptState.title}</h2>
                     <button onClick={() => setPromptState(prev => ({ ...prev, isOpen: false }))} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-8">
                     <input
                        type="text"
                        defaultValue={promptState.initialValue}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') promptState.onSubmit(e.currentTarget.value);
                        }}
                        placeholder={promptState.placeholder}
                        className="w-full bg-[#1a1f26] border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 text-white"
                        autoFocus
                     />
                  </div>
                  <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                     <button
                        onClick={() => setPromptState(prev => ({ ...prev, isOpen: false }))}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl text-xs font-bold transition-all"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={(e) => {
                           const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
                           if (input) promptState.onSubmit(input.value);
                        }}
                        className="px-6 py-2.5 bg-primary hover:bg-lemon text-slate-900 rounded-2xl text-xs font-bold transition-all"
                     >
                        Confirm
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
      </>
   );
};

export default function DocsEditor({ content, onChange, title, onTitleChange }: DocsEditorProps) {
   const [pages, setPages] = useState([1]);

   const editor = useEditor({
      extensions: [
         StarterKit,
         TextStyle,
         Color,
         Underline,
         TextAlign.configure({ types: ['heading', 'paragraph'] }),
         Image,
         Table.configure({ resizable: true }),
         TableRow,
         TableHeader,
         TableCell,
         TaskList,
         TaskItem.configure({ nested: true }),
         Strike,
         Superscript,
         Subscript,
         Highlight.configure({ multicolor: true }),
         Link.configure({ openOnClick: false }),
         CharacterCount,
         Typography,
         HorizontalRule,
         LineHeight,
         FontFamily
      ],
      content: content || '<p>Start typing...</p>',
      onUpdate: ({ editor }) => {
         onChange(editor.getHTML());
      },
      editorProps: {
         attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none min-h-[800px]',
         },
      },
   });

   useEffect(() => {
      if (!editor) return;
      const handleEditorAction = (e: Event) => {
         const customEvent = e as CustomEvent;
         const { action } = customEvent.detail;
         
         switch (action) {
            case 'undo': editor.chain().focus().undo().run(); break;
            case 'redo': editor.chain().focus().redo().run(); break;
            case 'cut': document.execCommand('cut'); break;
            case 'copy': document.execCommand('copy'); break;
            case 'paste': navigator.clipboard.readText().then(text => editor.chain().focus().insertContent(text).run()); break;
            case 'insert-image': 
               if ((window as any).__openDocsPrompt) {
                  (window as any).__openDocsPrompt('Insert Image', 'Image URL', '', (url: string) => {
                     if (url) editor.chain().focus().setImage({ src: url }).run();
                  });
               }
               break;
            case 'insert-table': editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
            case 'insert-link':
               if ((window as any).__openDocsPrompt) {
                  (window as any).__openDocsPrompt('Insert Link', 'URL to link', '', (url: string) => {
                     if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                  });
               }
               break;
            case 'clear-formatting': editor.chain().focus().unsetAllMarks().clearNodes().run(); break;
            case 'fullscreen': 
               if (!document.fullscreenElement) document.documentElement.requestFullscreen();
               else document.exitFullscreen();
               break;
            case 'download': window.print(); break;
         }
      };
      
      document.addEventListener('editor-action', handleEditorAction);
      return () => document.removeEventListener('editor-action', handleEditorAction);
   }, [editor]);

   useEffect(() => {
      if (editor && content && content !== editor.getHTML()) {
         editor.commands.setContent(content);
      }
   }, [content, editor]);

   return (
      <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-hidden relative">
         <MenuBar editor={editor} />
         
         <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col items-center pb-20">
            {pages.map((pageNumber) => (
               <div
                  key={pageNumber}
                  className="w-full max-w-[816px] bg-white border border-gray-300 shadow-sm min-h-[1056px] p-[1in] relative flex-shrink-0 mb-6"
                  style={{ fontFamily: 'Arial' }}
               >
                  {pageNumber === 1 && (
                     <div className="space-y-4 mb-4">
                        <input
                           type="text"
                           value={title}
                           onChange={(e) => onTitleChange(e.target.value)}
                           className="w-full bg-transparent border-none focus:outline-none text-3xl text-gray-900 font-normal"
                           style={{ fontSize: `24px` }}
                           placeholder="Untitled document"
                        />
                        <div className="h-px bg-gray-200 w-full" />
                     </div>
                  )}

                  <div className="relative text-gray-900">
                     {pageNumber === 1 ? (
                        <EditorContent editor={editor} />
                     ) : (
                        <div className="w-full bg-transparent border-none focus:outline-none min-h-[800px] leading-relaxed text-gray-400 select-none">
                           Tiptap multi-page rendering placeholder (pagination engine needs virtualization)
                        </div>
                     )}
                  </div>

                  <div className="absolute bottom-4 right-8 text-xs text-gray-400 select-none">
                     Page {pageNumber} of {pages.length}
                  </div>
               </div>
            ))}
         </div>

         {/* Word Count Floating Panel */}
         <div className="absolute bottom-4 left-4 bg-white border border-gray-300 shadow-md rounded-lg p-2 text-xs text-gray-600 flex items-center gap-3 z-30 select-none">
            <div className="flex items-center gap-1">
               <span className="font-bold text-gray-900">{editor?.storage.characterCount.words()}</span> words
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <div className="flex items-center gap-1">
               <span className="font-bold text-gray-900">{editor?.storage.characterCount.characters()}</span> characters
            </div>
         </div>

         {/* Custom styles for Tiptap components */}
         <style>{`
            .ProseMirror p.is-editor-empty:first-child::before {
               color: #adb5bd;
               content: attr(data-placeholder);
               float: left;
               height: 0;
               pointer-events: none;
            }
            .ProseMirror table {
               border-collapse: collapse;
               margin: 0;
               overflow: hidden;
               table-layout: fixed;
               width: 100%;
            }
            .ProseMirror table td,
            .ProseMirror table th {
               border: 1px solid #ced4da;
               box-sizing: border-box;
               min-width: 1em;
               padding: 3px 5px;
               position: relative;
               vertical-align: top;
            }
            .ProseMirror table th {
               background-color: #f1f3f5;
               font-weight: bold;
               text-align: left;
            }
            .ProseMirror img {
               max-width: 100%;
               height: auto;
            }
            .ProseMirror ul[data-type="taskList"] {
               list-style: none;
               padding: 0;
            }
            .ProseMirror ul[data-type="taskList"] li {
               display: flex;
               align-items: flex-start;
            }
            .ProseMirror ul[data-type="taskList"] li > label {
               flex: 0 0 auto;
               margin-right: 0.5rem;
               user-select: none;
            }
            .ProseMirror ul[data-type="taskList"] li > div {
               flex: 1 1 auto;
            }
         `}</style>
      </div>
   );
}
