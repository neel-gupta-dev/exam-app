import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Vayl | Academic Success';
    const type = searchParams.get('type') || 'OS';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f1115',
            color: 'white',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #2a2e37 2%, transparent 0%), radial-gradient(circle at 75px 75px, #2a2e37 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1c1f26', padding: '60px 80px', borderRadius: '32px', border: '1px solid #3f3f46', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#a78bfa', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '6px' }}>
              VAYL • {type}
            </div>
            <div style={{ fontSize: 80, fontWeight: 900, textAlign: 'center', maxWidth: 900, lineHeight: 1.1 }}>
              {title}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
