export async function generateQRCode(text: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

export async function generateQRWithLogo(text: string, logoUrl?: string): Promise<string> {
  const qrDataUrl = await generateQRCode(text);
  
  if (!logoUrl) {
    return qrDataUrl;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const qrImage = new Image();
    
    qrImage.onload = () => {
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      
      ctx.drawImage(qrImage, 0, 0);
      
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        const logoSize = canvas.width * 0.2;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        
        resolve(canvas.toDataURL());
      };
      logo.onerror = () => resolve(qrDataUrl);
      logo.src = logoUrl;
    };
    
    qrImage.src = qrDataUrl;
  });
}

export async function generatePoster(
  campaignImage: string,
  title: string,
  qrCode: string,
  goalAmount: number,
  collectedAmount: number
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1200;
    canvas.height = 1600;
    
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    
    bgImage.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(bgImage, 0, 0, canvas.width, 800);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, 800);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Inter';
      ctx.textAlign = 'center';
      const maxWidth = 1100;
      const words = title.split(' ');
      let line = '';
      let y = 400;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, canvas.width / 2, y);
          line = word + ' ';
          y += 70;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
      
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 800, canvas.width, 800);
      
      const qrImage = new Image();
      qrImage.onload = () => {
        const qrSize = 300;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 900;
        
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
        
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 40px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to Donate', canvas.width / 2, 1250);
        
        const progress = Math.min((collectedAmount / goalAmount) * 100, 100);
        ctx.font = '32px Inter';
        ctx.fillText(
          `₹${collectedAmount.toLocaleString()} raised of ₹${goalAmount.toLocaleString()}`,
          canvas.width / 2,
          1320
        );
        
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(150, 1360, canvas.width - 300, 20);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(150, 1360, ((canvas.width - 300) * progress) / 100, 20);
        
        ctx.fillStyle = '#666666';
        ctx.font = '24px Inter';
        ctx.fillText('TrueFund - Fund What Matters', canvas.width / 2, 1480);
        
        resolve(canvas.toDataURL());
      };
      qrImage.src = qrCode;
    };
    
    bgImage.src = campaignImage;
  });
}
