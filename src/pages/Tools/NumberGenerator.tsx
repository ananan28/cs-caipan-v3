import React, { useState } from 'react';
import { Card } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Input } from '@/components/Forms/Input';
import { Copy, Download, RefreshCw, Plus, X, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

// 国家数据
const COUNTRIES = [
  { code: '+86', name: '中国', states: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'] },
  { code: '+1', name: '美国', states: ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA'] },
  { code: '+44', name: '英国', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
  { code: '+81', name: '日本', states: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka'] },
  { code: '+49', name: '德国', states: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'] },
  { code: '+33', name: '法国', states: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'] },
  { code: '+7', name: '俄罗斯', states: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg'] },
  { code: '+55', name: '巴西', states: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
  { code: '+91', name: '印度', states: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'] },
  { code: '+61', name: '澳大利亚', states: ['NSW', 'VIC', 'QLD', 'WA', 'SA'] },
  { code: '+82', name: '韩国', states: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'] },
  { code: '+39', name: '意大利', states: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'] },
  { code: '+34', name: '西班牙', states: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'] },
  { code: '+31', name: '荷兰', states: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { code: '+46', name: '瑞典', states: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'] },
];

// 城市区号映射
const CITY_CODES: Record<string, Record<string, string[]>> = {
  '中国': {
    '北京': ['10', '11', '12'],
    '上海': ['21', '22', '23'],
    '广州': ['20', '24', '25'],
    '深圳': ['755', '756', '757'],
    '杭州': ['571', '572', '573'],
    '成都': ['28', '29', '30'],
    '武汉': ['27', '31', '32'],
    '南京': ['25', '26', '33'],
  },
  '美国': {
    'CA': ['213', '310', '323', '408', '415', '510', '562', '619', '626', '650', '661', '714', '760', '805', '818', '831', '858', '909', '916', '925', '949', '951'],
    'NY': ['212', '315', '347', '516', '518', '585', '607', '631', '646', '716', '718', '845', '914', '917'],
    'TX': ['210', '214', '254', '281', '325', '361', '409', '432', '469', '512', '682', '713', '737', '806', '817', '830', '832', '903', '915', '936', '940', '956', '972', '979'],
    'FL': ['239', '305', '321', '352', '386', '407', '561', '586', '689', '727', '754', '772', '786', '813', '850', '863', '904', '941', '954'],
  },
  '英国': {
    'England': ['20', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '141', '142', '143', '144', '145', '146', '147', '148', '149', '151', '152', '153', '154', '155', '156', '157', '158', '159', '161', '162'],
    'Scotland': ['131', '133', '134', '135', '136', '137', '138', '139'],
    'Wales': ['29', '144', '163', '164', '165', '166', '167', '168', '169', '174'],
  },
};

export default function NumberGenerator() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAreaCode, setSelectedAreaCode] = useState('');
  const [prefix, setPrefix] = useState('');
  const [count, setCount] = useState(10);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const getStates = () => {
    const country = COUNTRIES.find(c => c.name === selectedCountry);
    return country ? country.states : [];
  };

  const getCityCodes = () => {
    if (!selectedCountry || !selectedState) return [];
    const codes = CITY_CODES[selectedCountry];
    return codes && codes[selectedState] ? codes[selectedState] : [];
  };

  const generateNumber = () => {
    if (!selectedCountry || !selectedState || !selectedCity || !selectedAreaCode) {
      toast.error('请完整选择国家、州、城市和区号');
      return;
    }

    setIsGenerating(true);
    const country = COUNTRIES.find(c => c.name === selectedCountry);
    const countryCode = country?.code || '+86';
    
    const numbers: string[] = [];
    const prefixStr = prefix || '';
    
    for (let i = 0; i < count; i++) {
      const digits = Math.floor(Math.random() * 90000000 + 10000000);
      const number = `${countryCode}${selectedAreaCode}${prefixStr}${digits}`;
      numbers.push(number);
    }
    
    setGeneratedNumbers(numbers);
    setIsGenerating(false);
    toast.success(`成功生成 ${numbers.length} 个号码`);
  };

  const copyNumbers = () => {
    navigator.clipboard.writeText(generatedNumbers.join('\n'));
    toast.success('已复制到剪贴板');
  };

  const downloadCSV = () => {
    const csv = generatedNumbers.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `numbers_${selectedCountry}_${selectedState}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('下载成功');
  };

  const clearNumbers = () => {
    setGeneratedNumbers([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Phone className="w-6 h-6 text-yellow-400" />
          全球号码生成器
        </h1>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">国家</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedState('');
                  setSelectedCity('');
                  setSelectedAreaCode('');
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="">选择国家</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>{c.name} {c.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">州/省</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity('');
                  setSelectedAreaCode('');
                }}
                disabled={!selectedCountry}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              >
                <option value="">选择州/省</option>
                {getStates().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">城市</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedAreaCode('');
                }}
                disabled={!selectedState}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              >
                <option value="">选择城市</option>
                {getCityCodes().map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">区号</label>
              <select
                value={selectedAreaCode}
                onChange={(e) => setSelectedAreaCode(e.target.value)}
                disabled={!selectedCity}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              >
                <option value="">选择区号</option>
                {getCityCodes().map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">前缀 (可选)</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="例如: 138"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">生成数量</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                {[1, 5, 10, 20, 50, 100, 200, 500].map((n) => (
                  <option key={n} value={n}>{n} 个</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateNumber}
            disabled={isGenerating || !selectedAreaCode}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '🚀 生成号码'}
          </button>
        </div>
      </Card>

      {generatedNumbers.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">生成结果</span>
                <span className="text-yellow-400 text-sm">({generatedNumbers.length} 个号码)</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyNumbers}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  复制
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition text-sm flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  导出CSV
                </button>
                <button
                  onClick={clearNumbers}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  清除
                </button>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {generatedNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700/30 px-3 py-2 rounded-lg text-white text-sm font-mono hover:bg-gray-700/50 transition cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(num);
                      toast.success('已复制: ' + num);
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
