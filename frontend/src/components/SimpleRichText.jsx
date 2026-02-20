import { useState, useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaListUl } from 'react-icons/fa';

const SimpleRichText = ({ initialValue, onChange, placeholder }) => {
    const editorRef = useRef(null);
    const [content, setContent] = useState(initialValue || '');

    // Execute command
    const execCmd = (cmd) => {
        document.execCommand(cmd, false, null);
        editorRef.current.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setContent(html);
            onChange(html);
        }
    };

    // Prevent re-rendering/losing cursor issues by not syncing content prop back to innerHTML 
    // strictly on every render, only on mount or if external change forces it (not implemented here for simplicity)
    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML && initialValue) {
            editorRef.current.innerHTML = initialValue;
        }
    }, []);

    return (
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-yellow-100 border-b border-yellow-200">
                <button
                    onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
                    className="p-1.5 hover:bg-yellow-200 rounded text-yellow-800"
                    title="Bold"
                >
                    <FaBold size={12} />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
                    className="p-1.5 hover:bg-yellow-200 rounded text-yellow-800"
                    title="Italic"
                >
                    <FaItalic size={12} />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
                    className="p-1.5 hover:bg-yellow-200 rounded text-yellow-800"
                    title="List"
                >
                    <FaListUl size={12} />
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className="flex-1 p-3 outline-none overflow-auto text-sm text-gray-700 min-h-[100px]"
                onInput={handleInput}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
            />
        </div>
    );
};

export default SimpleRichText;
