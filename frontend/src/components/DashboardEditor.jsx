import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaTrash, FaPlus, FaImage, FaStickyNote, FaUndo, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import API from '../api/axios';

const SortableItem = ({ id, widget, onRemove, onUpdateData }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire('Error', 'Ukuran file maksimal 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Upload immediately
            const { data } = await API.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Update widget data with file path (prepend backend URL if needed, or relative)
            // Assuming proxy or base URL handles relative paths
            const imageUrl = `${API.defaults.baseURL.replace('/api', '')}${data.filePath}`;
            onUpdateData(id, imageUrl);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal mengunggah gambar', 'error');
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 flex items-center justify-between group"
        >
            <div className="flex items-center gap-4 flex-1">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                    <FaGripVertical />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${widget.type === 'System' ? 'bg-blue-100 text-blue-700' :
                                widget.type === 'Image' ? 'bg-green-100 text-green-700' :
                                    'bg-yellow-100 text-yellow-700'
                            }`}>
                            {widget.type === 'System' ? 'Sistem' : widget.type === 'Image' ? 'Gambar' : 'Catatan'}
                        </span>
                        <h4 className="font-semibold text-gray-800">{widget.content}</h4>
                    </div>

                    {/* Editor Controls */}
                    {widget.type === 'Image' && (
                        <div className="mt-2 text-sm text-gray-500">
                            {widget.data ? (
                                <div className="relative w-24 h-16 rounded overflow-hidden border">
                                    <img src={widget.data} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <p className="italic text-xs text-red-400">Belum ada gambar</p>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="mt-2 text-xs"
                            />
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => onRemove(id)}
                className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                title="Hapus Widget"
            >
                <FaTrash />
            </button>
        </div>
    );
};

const DashboardEditor = ({ initialConfig, onSave, onCancel }) => {
    const [widgets, setWidgets] = useState(initialConfig || []);

    // Default system widgets that can be re-added if removed
    const availableWidgets = [
        { type: 'Custom', subType: 'note', label: 'Catatan Baru', icon: <FaStickyNote />, content: 'Catatan Baru' },
        { type: 'Custom', subType: 'image', label: 'Gambar / Banner', icon: <FaImage />, content: 'Gambar Baru' }
    ];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddWidget = (widgetType) => {
        const newId = `widget-${Date.now()}`;
        const newWidget = {
            id: newId,
            type: widgetType === 'image' ? 'Image' : 'Custom',
            content: widgetType === 'image' ? 'Gambar Dekorasi' : 'Catatan Kustom',
            data: '' // Empty initial data
        };
        setWidgets([...widgets, newWidget]);
    };

    const handleRemoveWidget = (id) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const handleUpdateData = (id, data) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, data } : w));
    };

    const handleReset = () => {
        Swal.fire({
            title: 'Reset Layout?',
            text: "Susunan dashboard akan kembali ke pengaturan awal.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Reset',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Default Layout
                setWidgets([
                    { id: 'overview', type: 'System', content: 'Ringkasan Akademik' },
                    { id: 'motivation', type: 'System', content: 'Kutipan Motivasi' },
                    { id: 'notes', type: 'Custom', content: 'Catatan Pribadi', data: '' },
                ]);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">

                {/* Sidebar Controls */}
                <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Edit Dashboard</h2>
                        <p className="text-sm text-gray-500">Sesuaikan tampilan dashboard-mu.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-600 block">Tambah Widget</label>
                        <button
                            onClick={() => handleAddWidget('note')}
                            className="w-full flex items-center gap-3 p-3 bg-white border border-yellow-200 rounded-lg shadow-sm hover:bg-yellow-50 transition text-yellow-700"
                        >
                            <FaStickyNote /> Tambah Catatan
                        </button>
                        <button
                            onClick={() => handleAddWidget('image')}
                            className="w-full flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg shadow-sm hover:bg-green-50 transition text-green-700"
                        >
                            <FaImage /> Tambah Gambar
                        </button>
                    </div>

                    <div className="mt-auto space-y-3 pt-6 border-t">
                        <button
                            onClick={handleReset}
                            className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm flex items-center justify-center gap-2"
                        >
                            <FaUndo /> Reset Default
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => onSave(widgets)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                            >
                                <FaSave /> Simpan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Preview / Sortable Area */}
                <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Susunan Aktif (Drag untuk Mengatur)</h3>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={widgets.map(w => w.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {widgets.map((widget) => (
                                    <SortableItem
                                        key={widget.id}
                                        id={widget.id}
                                        widget={widget}
                                        onRemove={handleRemoveWidget}
                                        onUpdateData={handleUpdateData}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {widgets.length === 0 && (
                            <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                                Dashboard kosong. Tambahkan widget dari menu sebelah kiri.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardEditor;
