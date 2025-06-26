
import React from 'react';
import QRCodeReader from './QRCodeReader';

interface QRScannerProps {
  onScanResult: (data: any) => void;
}

const QRScanner = ({ onScanResult }: QRScannerProps) => {
  return <QRCodeReader onScanResult={onScanResult} />;
};

export default QRScanner;
