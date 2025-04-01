import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Brush, Eraser, Undo2, RotateCw, Save } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Checkbox } from '@/components/ui/checkbox';

type DrawingMode = 'brush' | 'eraser';
type DamageType = 'dent' | 'scratch';

interface VehicleCanvasProps {
  vehicleType?: 'sedan' | 'suv' | 'hatchback' | 'truck';
  onSave?: (imageData: string) => void;
  onChange?: (imageData: string) => void;
  initialImage?: string;
  viewOnly?: boolean;
}

export function VehicleCanvas({ 
  vehicleType = 'sedan', 
  onSave, 
  onChange,
  initialImage,
  viewOnly = false
}: VehicleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('brush');
  const [damageType, setDamageType] = useState<DamageType>('dent');
  const [history, setHistory] = useState<string[]>([]);
  const [view, setView] = useState<'front' | 'back' | 'left' | 'right' | 'top'>('top');
  
  const damageColors = {
    dent: 'rgba(255, 0, 0, 0.7)',
    scratch: 'rgba(0, 0, 255, 0.7)'
  };

  const brushSize = 8;
  const eraserSize = 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawVehicleOutline(ctx, vehicleType, view);

    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = initialImage;
    } else {
      saveToHistory();
    }
  }, [vehicleType, view]);

  const drawVehicleOutline = (ctx: CanvasRenderingContext2D, type: string, view: string) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    if (view === 'top') {
      ctx.beginPath();
      
      if (type === 'sedan') {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.roundRect(width * 0.2, height * 0.15, width * 0.6, height * 0.7, 40);
        
        ctx.moveTo(width * 0.3, height * 0.3);
        ctx.lineTo(width * 0.45, height * 0.3);
        ctx.lineTo(width * 0.45, height * 0.7);
        ctx.lineTo(width * 0.3, height * 0.7);
        ctx.lineTo(width * 0.3, height * 0.3);
        
        ctx.moveTo(width * 0.55, height * 0.3);
        ctx.lineTo(width * 0.7, height * 0.3);
        ctx.lineTo(width * 0.7, height * 0.7);
        ctx.lineTo(width * 0.55, height * 0.7);
        ctx.lineTo(width * 0.55, height * 0.3);
      } else if (type === 'suv') {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.roundRect(width * 0.15, height * 0.15, width * 0.7, height * 0.7, 20);
      } else if (type === 'hatchback') {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.roundRect(width * 0.25, height * 0.2, width * 0.5, height * 0.6, 30);
      } else {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.roundRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6, 30);
      }
      
      ctx.stroke();
      
      ctx.fillStyle = "#888";
      ctx.font = "14px sans-serif";
      ctx.fillText("FRONT", ctx.canvas.width / 2 - 20, 30);
      ctx.fillText("REAR", ctx.canvas.width / 2 - 20, ctx.canvas.height - 15);
    } else {
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText(`${type} - ${view} view (simplified)`, 20, 30);
      
      ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewOnly) return;
    
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
    
    if (drawingMode === 'brush') {
      ctx.strokeStyle = damageColors[damageType];
      ctx.lineWidth = brushSize;
    } else {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = eraserSize;
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || viewOnly) return;
    
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
    if (isDrawing && !viewOnly) {
      setIsDrawing(false);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.globalCompositeOperation = 'source-over';
      
      saveToHistory();
    }
  };
  
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    setHistory(prev => [...prev.slice(0, 20), imageData]);
    
    if (onChange) {
      onChange(imageData);
    }
  };
  
  const undo = () => {
    if (history.length <= 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    
    if (newHistory.length > 0) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = newHistory[newHistory.length - 1];
    }
  };
  
  const reset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawVehicleOutline(ctx, vehicleType, view);
    
    saveToHistory();
    toast.info("Canvas has been reset");
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    
    if (onSave) {
      onSave(imageData);
    }
    
    if (onChange) {
      onChange(imageData);
    }
    
    toast.success("Damage marking saved successfully");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>Vehicle Damage Marking</CardTitle>
        <CardDescription>
          {viewOnly 
            ? "View marked damage on the vehicle"
            : "Mark any dents, scratches, or damage on the vehicle"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="canvas-container bg-secondary/50 w-full aspect-video overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="drawing-canvas w-full h-auto"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </CardContent>
      {!viewOnly && (
        <CardFooter className="flex flex-wrap gap-2 justify-between border-t p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <ToggleGroup type="single" value={drawingMode} onValueChange={(value) => value && setDrawingMode(value as DrawingMode)}>
              <ToggleGroupItem value="brush" className="gap-1" aria-label="Toggle brush">
                <Brush className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:text-xs">Brush</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="eraser" className="gap-1" aria-label="Toggle eraser">
                <Eraser className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:text-xs">Eraser</span>
              </ToggleGroupItem>
            </ToggleGroup>
            
            {drawingMode === 'brush' && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dent" 
                    checked={damageType === 'dent'} 
                    onCheckedChange={() => setDamageType('dent')}
                  />
                  <label
                    htmlFor="dent"
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span>
                    Dent
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="scratch" 
                    checked={damageType === 'scratch'} 
                    onCheckedChange={() => setDamageType('scratch')}
                  />
                  <label
                    htmlFor="scratch"
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="w-3 h-3 inline-block bg-blue-500 rounded-full mr-1"></span>
                    Scratch
                  </label>
                </div>
              </div>
            )}
            
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as any)}>
              <ToggleGroupItem value="top" aria-label="Top view">Top</ToggleGroupItem>
              <ToggleGroupItem value="left" aria-label="Left view">Left</ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Right view">Right</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={history.length <= 1}>
              <Undo2 className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCw className="h-4 w-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
