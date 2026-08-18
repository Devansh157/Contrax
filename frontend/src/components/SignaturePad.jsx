import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'upload'
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (signatureMode !== 'draw') return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0f172a'; // dark signature ink
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      // Handle resize matching bounds
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [signatureMode]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // For touch devices
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // For mouse clicks
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasSigned(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
        if (onClear) onClear();
      }
    } else {
      setUploadedImage(null);
      if (onClear) onClear();
    }
  };

  const handleSave = () => {
    if (signatureMode === 'draw') {
      if (!hasSigned) return;
      const canvas = canvasRef.current;
      if (canvas) {
        // Export signature as PNG Data URL
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
      }
    } else {
      if (!uploadedImage) return;
      onSave(uploadedImage);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const canLock = signatureMode === 'draw' ? hasSigned : !!uploadedImage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Mode Selector Tab Container */}
      <div 
        style={{ 
          display: 'flex', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(128, 128, 128, 0.1)', 
          padding: '4px',
          width: '100%',
          maxWidth: '300px'
        }}
      >
        <button
          type="button"
          onClick={() => setSignatureMode('draw')}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: signatureMode === 'draw' ? 'var(--bg-secondary)' : 'transparent',
            color: signatureMode === 'draw' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: signatureMode === 'draw' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setSignatureMode('upload')}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: signatureMode === 'upload' ? 'var(--bg-secondary)' : 'transparent',
            color: signatureMode === 'upload' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: signatureMode === 'upload' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Upload Image
        </button>
      </div>

      <div className="signature-container">
        {signatureMode === 'draw' ? (
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            style={{ background: '#f8fafc' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: isDragOver ? 'rgba(8, 145, 178, 0.05)' : 'var(--bg-secondary)',
              transition: 'all 0.2s ease',
              padding: '1rem',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            {uploadedImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                <img 
                  src={uploadedImage} 
                  alt="Signature Preview" 
                  style={{ 
                    maxHeight: '120px', 
                    maxWidth: '90%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' 
                  }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to replace file</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={24} style={{ color: isDragOver ? 'var(--secondary)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isDragOver ? 'Drop file here' : 'Upload Signature Image'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Drag & drop or click to browse (PNG, JPG, max 2MB)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }} onClick={handleClear}>
          Clear
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.5rem' }}
          onClick={handleSave}
          disabled={!canLock}
        >
          Lock Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
