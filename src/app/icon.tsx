import { ImageResponse } from 'next/og';
import { join } from 'path';
import { readFileSync } from 'fs';

export const contentType = 'image/jpeg';
export const size = { width: 64, height: 64 };

export default function Icon() {
  let base64Image = '';
  try {
    const imageBuffer = readFileSync(join(process.cwd(), 'public', 'logo.jpeg'));
    base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  } catch (e) {
    console.error("Failed to load logo.jpeg for favicon generation");
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'black'
        }}
      >
        {base64Image ? (
          <img 
            src={base64Image} 
            style={{ 
              width: '130%', 
              height: '130%', 
              objectFit: 'cover' 
            }} 
          />
        ) : (
           <div style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>LP</div>
        )}
      </div>
    ),
    { ...size }
  );
}
