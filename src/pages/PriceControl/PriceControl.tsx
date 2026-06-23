import React, { useState, useEffect } from 'react';

interface PriceItem {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive';
  updatedAt: string;
  description: string;
}

export const PriceControl: React.FC = () => {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = () => {
      const saved = localStorage.getItem('price_control_data');
      if (saved) {
        try {
          setPrices(JSON.parse(saved));
        } catch {
          setPrices([]);
        }
      } else {
        setPrices([]);
      }
      setLoading(false);
    };
    loadPrices();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">加载中...</div>;
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">价格控制台</h1>
        <div className="bg-[#12182b] border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400">价格控制台功能开发中...</p>
          <p className="text-gray-500 text-sm mt-2">当前配置项数量: {prices.length}</p>
        </div>
      </div>
    </div>
  );
};

export default PriceControl;
