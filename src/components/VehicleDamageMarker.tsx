
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car, Download, RotateCw, Eraser, Brush } from 'lucide-react';

interface VehicleDamageMarkerProps {
  onImageSave: (imageDataUrl: string) => void;
  existingImageUrl?: string;
}

export function VehicleDamageMarker({ onImageSave, existingImageUrl }: VehicleDamageMarkerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);
  const [carView, setCarView] = useState<'top' | 'side' | 'front'>('top');
  
  // Initialize canvas context and load background image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw car outline based on selected view
    drawCarOutline(ctx, carView);
    
    // If there's an existing image, load it
    if (existingImageUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existingImageUrl;
    }
  }, [carView, existingImageUrl]);

  // Function to draw car outline based on view
  const drawCarOutline = (ctx: CanvasRenderingContext2D, view: 'top' | 'side' | 'front') => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    switch (view) {
      case 'top':
        // Draw top view of car
        ctx.beginPath();
        // Car outline (oval shape)
        ctx.ellipse(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 3, ctx.canvas.height / 2.5, 0, 0, 2 * Math.PI);
        // Windshield
        ctx.moveTo(ctx.canvas.width / 2 - 60, ctx.canvas.height / 2 - 50);
        ctx.lineTo(ctx.canvas.width / 2 + 60, ctx.canvas.height / 2 - 50);
        // Rear window
        ctx.moveTo(ctx.canvas.width / 2 - 60, ctx.canvas.height / 2 + 50);
        ctx.lineTo(ctx.canvas.width / 2 + 60, ctx.canvas.height / 2 + 50);
        ctx.stroke();
        break;
        
      case 'side':
        // Draw side view of car
        ctx.beginPath();
        // Car body
        ctx.moveTo(50, ctx.canvas.height / 2 + 50);
        ctx.lineTo(ctx.canvas.width - 50, ctx.canvas.height / 2 + 50); // Bottom line
        ctx.lineTo(ctx.canvas.width - 80, ctx.canvas.height / 2 - 10); // Rear slope
        ctx.lineTo(ctx.canvas.width - 150, ctx.canvas.height / 2 - 40); // Roof back
        ctx.lineTo(150, ctx.canvas.height / 2 - 40); // Roof front
        ctx.lineTo(80, ctx.canvas.height / 2 - 10); // Windshield
        ctx.lineTo(50, ctx.canvas.height / 2 + 50); // Close the path
        
        // Wheels
        ctx.moveTo(100, ctx.canvas.height / 2 + 50);
        ctx.arc(100, ctx.canvas.height / 2 + 50, 30, 0, 2 * Math.PI); // Front wheel
        ctx.moveTo(ctx.canvas.width - 100, ctx.canvas.height / 2 + 50);
        ctx.arc(ctx.canvas.width - 100, ctx.canvas.height / 2 + 50, 30, 0, 2 * Math.PI); // Rear wheel
        
        ctx.stroke();
        break;
        
      case 'front':
        // Draw front view of car
        ctx.beginPath();
        // Car body
        ctx.rect(ctx.canvas.width / 2 - 100, ctx.canvas.height / 2 - 40, 200, 80);
        
        // Hood
        ctx.moveTo(ctx.canvas.width / 2 - 100, ctx.canvas.height / 2 - 40);
        ctx.lineTo(ctx.canvas.width / 2 - 120, ctx.canvas.height / 2 - 60);
        ctx.lineTo(ctx.canvas.width / 2 + 120, ctx.canvas.height / 2 - 60);
        ctx.lineTo(ctx.canvas.width / 2 + 100, ctx.canvas.height / 2 - 40);
        
        // Windshield
        ctx.moveTo(ctx.canvas.width / 2 - 80, ctx.canvas.height / 2 - 40);
        ctx.lineTo(ctx.canvas.width / 2 - 60, ctx.canvas.height / 2 - 80);
        ctx.lineTo(ctx.canvas.width / 2 + 60, ctx.canvas.height / 2 - 80);
        ctx.lineTo(ctx.canvas.width / 2 + 80, ctx.canvas.height / 2 - 40);
        
        // Headlights
        ctx.moveTo(ctx.canvas.width / 2 - 80, ctx.canvas.height / 2);
        ctx.rect(ctx.canvas.width / 2 - 90, ctx.canvas.height / 2 - 20, 40, 40);
        ctx.moveTo(ctx.canvas.width / 2 + 80, ctx.canvas.height / 2);
        ctx.rect(ctx.canvas.width / 2 + 50, ctx.canvas.height / 2 - 20, 40, 40);
        
        ctx.stroke();
        break;
    }
  };

  // Mouse event handlers for drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Clear canvas and redraw car outline
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawCarOutline(ctx, carView);
  };
  
  // Save canvas as image
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageDataUrl = canvas.toDataURL('image/png');
    onImageSave(imageDataUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Damage Marker
        </CardTitle>
        <CardDescription>
          Mark areas of damage on the vehicle diagram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant={carView === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCarView('top')}
            >
              Top View
            </Button>
            <Button
              variant={carView === 'side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCarView('side')}
            >
              Side View
            </Button>
            <Button
              variant={carView === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCarView('front')}
            >
              Front View
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div>
              <Label htmlFor="brush-color" className="mr-2">Color:</Label>
              <input
                id="brush-color"
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="h-8 w-8 cursor-pointer"
              />
            </div>
            <div className="flex items-center">
              <Label htmlFor="brush-size" className="mr-2">Size:</Label>
              <input
                id="brush-size"
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
          
          <div className="border rounded-md p-1 bg-gray-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-auto bg-white border rounded cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearCanvas}
                className="flex items-center gap-1"
              >
                <Eraser className="h-4 w-4" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  drawCarOutline(ctx, carView);
                }}
                className="flex items-center gap-1"
              >
                <RotateCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <Button 
              onClick={saveImage} 
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
