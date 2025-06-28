import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Eye, Smartphone, Tablet, Monitor, Save, Undo, Redo } from 'lucide-react';
import SectionBlock from './SectionBlock';
import Button from './Button';

const EditorCanvas = ({ 
  blocks = [], 
  selectedBlockId, 
  onSelectBlock, 
  onUpdateBlocks, 
  onSave,
  saving = false 
}) => {
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef(null);

  const viewModes = [
    { id: 'desktop', icon: Monitor, width: '100%' },
    { id: 'tablet', icon: Tablet, width: '768px' },
    { id: 'mobile', icon: Smartphone, width: '375px' }
  ];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newBlocks = Array.from(blocks);
    const [reorderedBlock] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedBlock);

    onUpdateBlocks && onUpdateBlocks(newBlocks);
  };

  const handleBlockUpdate = (blockId, updatedBlock) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? updatedBlock : block
    );
    onUpdateBlocks && onUpdateBlocks(newBlocks);
  };

  const handleDeleteBlock = (blockId) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onUpdateBlocks && onUpdateBlocks(newBlocks);
  };

  const handleToggleVisibility = (block) => {
    handleBlockUpdate(block.id, { ...block, visible: !block.visible });
  };

  const renderBlockPreview = (block) => {
    const { type, content } = block;
    
    switch (type) {
      case 'hero':
        return (
          <div 
            className="relative h-96 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white"
            style={{ 
              backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative text-center space-y-4 px-4">
              <h1 className="text-4xl md:text-6xl font-bold">{content.title || 'Hero Title'}</h1>
              <p className="text-xl md:text-2xl opacity-90">{content.subtitle || 'Hero subtitle'}</p>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {content.buttonText || 'Get Started'}
              </button>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="py-16 px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title || 'About Us'}</h2>
                <p className="text-gray-600 leading-relaxed">{content.description || 'About description'}</p>
              </div>
              {content.image && (
                <img src={content.image} alt="About" className="rounded-lg shadow-lg" />
              )}
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="py-16 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">{content.title || 'Our Services'}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {(content.services || []).map((service, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{content.title || 'Contact Us'}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">{content.email || 'email@example.com'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600">{content.phone || '+1 (555) 123-4567'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-gray-600">{content.address || '123 Main St, City'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="py-16 px-4 bg-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-700">{block.name}</h3>
            <p className="text-gray-500">Preview for {type} section</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {viewModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === mode.id 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={mode.id}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                previewMode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Undo/Redo */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors">
                <Undo className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors">
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Save Button */}
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              loading={saving}
              onClick={onSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <motion.div
            ref={canvasRef}
            layout
            className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300"
            style={{ 
              width: viewModes.find(m => m.id === viewMode)?.width,
              maxWidth: '100%'
            }}
          >
            {previewMode ? (
              /* Preview Mode */
              <div className="min-h-screen">
                {blocks.filter(block => block.visible).map((block) => (
                  <div key={block.id}>
                    {renderBlockPreview(block)}
                  </div>
                ))}
              </div>
            ) : (
              /* Edit Mode */
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="canvas">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-screen p-4 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-purple-50' : 'bg-white'
                      }`}
                    >
                      <AnimatePresence>
                        {blocks.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg"
                          >
                            <div className="text-center">
                              <div className="text-6xl mb-4">🎨</div>
                              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Start Building Your Page
                              </h3>
                              <p className="text-gray-500">
                                Drag blocks from the sidebar to start creating your page
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          blocks.map((block, index) => (
                            <Draggable key={block.id} draggableId={block.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="mb-4"
                                >
                                  <SectionBlock
                                    block={block}
                                    isSelected={selectedBlockId === block.id}
                                    onSelect={onSelectBlock}
                                    onEdit={() => onSelectBlock(block)}
                                    onDelete={() => handleDeleteBlock(block.id)}
                                    onToggleVisibility={handleToggleVisibility}
                                    isDragging={snapshot.isDragging}
                                    dragHandleProps={provided.dragHandleProps}
                                  />
                                  
                                  {/* Block Preview */}
                                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                                    {renderBlockPreview(block)}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;