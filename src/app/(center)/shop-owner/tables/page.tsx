'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  QrCode,
  Download,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { PageLoader, ButtonLoader } from '@/components/page-loader';
import { authenticatedFetch } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';

type HawkerTable = {
  id: string;
  restaurant_id: string;
  table_number: string;
  created_at: string;
};

type Shop = {
  id: string;
  name: string;
  slug: string;
  tables: HawkerTable[];
};

export default function TablesManagementPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Table State
  const [newTableNumber, setNewTableNumber] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  
  // Print Ref
  const printRef = useRef<HTMLDivElement>(null);

  const fetchShopsAndTables = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch shops
      const shopsResponse = await authenticatedFetch('/api/owner/shops');
      if (!shopsResponse.ok) throw new Error('Failed to fetch food halls');
      const { shops: fetchedShops } = await shopsResponse.json();
      
      if (!fetchedShops || fetchedShops.length === 0) {
        setShops([]);
        setLoading(false);
        return;
      }
      
      // Fetch tables for all shops sequentially (or could be parallelized)
      const shopsWithTables = await Promise.all(
        fetchedShops.map(async (shop: any) => {
          try {
            const tablesRes = await authenticatedFetch(`/api/owner/tables?restaurantId=${shop.id}`);
            if (tablesRes.ok) {
              const { tables } = await tablesRes.json();
              return { ...shop, tables: tables || [] };
            }
          } catch (e) {
             console.error('Failed to fetch tables for shop', shop.id);
          }
          return { ...shop, tables: [] };
        })
      );
      
      setShops(shopsWithTables);
      if (shopsWithTables.length > 0) {
        setSelectedShopId(shopsWithTables[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading your tables.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchShopsAndTables();
  }, [fetchShopsAndTables]);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim() || !selectedShopId) return;
    
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    
    try {
      const res = await authenticatedFetch('/api/owner/tables', {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: selectedShopId,
          tableNumber: newTableNumber,
        }),
      });
      
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to create table');
      }
      
      const { table } = await res.json();
      
      setShops(prev => prev.map(shop => {
        if (shop.id === selectedShopId) {
          return { ...shop, tables: [...shop.tables, table] };
        }
        return shop;
      }));
      
      setNewTableNumber('');
      setCreateSuccess(`Table ${table.table_number} added successfully.`);
      setTimeout(() => setCreateSuccess(''), 3000);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to add table.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTable = async (tableId: string, shopId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const res = await authenticatedFetch(`/api/owner/tables?id=${tableId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete table');
      
      setShops(prev => prev.map(shop => {
        if (shop.id === shopId) {
          return { ...shop, tables: shop.tables.filter(t => t.id !== tableId) };
        }
        return shop;
      }));
    } catch (err) {
      alert('Could not delete table. Please try again.');
    }
  };

  const downloadQR = (table: HawkerTable, shopSlug: string) => {
    const svg = document.getElementById(`qr-${table.id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 60;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Table ${table.table_number}`, canvas.width / 2, canvas.height - 15);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Table-${table.table_number}-QR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrintAll = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="text-align: center; margin-bottom: 30px;">Table QR Codes</h1>
        ${printContent}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore event listeners
  };

  if (loading) {
    return <PageLoader text="Loading your tables…" />;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] pb-24 text-[#1d1d1f]">
      {/* Header */}
      <div className="bg-white ">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/shop-owner"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-black/5 "
            >
              <ChevronLeft className="w-4 h-4 text-[#1d1d1f]" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
                Table Management
              </h1>
              <p className="text-sm text-[#6e6e73] mt-1">
                Manage seating and generate QR codes for diners.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {shops.length === 0 && !error ? (
          <div className="rounded-[26px] bg-white p-8 text-center text-sm text-[#6e6e73] shadow-xs">
            No venues found. Please create a venue first.
          </div>
        ) : (
          <>
            {/* Table Creation */}
            <div className="rounded-[26px] bg-white p-6 shadow-xs">
              <h2 className="text-lg font-semibold mb-4">Add New Table</h2>
              <form onSubmit={handleCreateTable} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-[#86868b] mb-1">
                    Select Venue
                  </label>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                    className="w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#007aff]/20"
                  >
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-[#86868b] mb-1">
                    Table Number / Label
                  </label>
                  <input
                    type="text"
                    required
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="e.g. 12 or A1"
                    className="w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#007aff]/20"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={creating || !newTableNumber.trim()}
                  className="w-full sm:w-auto h-[46px] px-6 rounded-full bg-[#111827] text-white text-sm font-semibold shadow-xs hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <ButtonLoader text="Adding..." /> : <><Plus className="w-4 h-4" /> Add Table</>}
                </button>
              </form>
              
              {createError && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4" /> {createError}
                </p>
              )}
              {createSuccess && (
                <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {createSuccess}
                </p>
              )}
            </div>

            {/* Tables List */}
            {shops.map((shop) => (
              <div key={shop.id} className="rounded-[26px] bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f]">{shop.name}</h2>
                    <p className="text-sm text-[#86868b]">{shop.tables.length} table(s) registered</p>
                  </div>
                  {shop.tables.length > 0 && (
                    <button
                      onClick={handlePrintAll}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-sm hover:bg-neutral-200"
                    >
                      <Printer className="w-4 h-4" /> Print All QRs
                    </button>
                  )}
                </div>

                {shop.tables.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#86868b] bg-[#f5f5f7] rounded-2xl">
                    No tables added for this venue yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shop.tables.map((table) => {
                      const scanUrl = `${window.location.origin}/scan?outlet_id=${shop.id}&table_id=${table.id}`;
                      
                      return (
                        <div key={table.id} className="rounded-2xl bg-white p-5 flex flex-col items-center shadow-md">
                          <h3 className="text-lg font-bold mb-4">Table {table.table_number}</h3>
                          
                          <div className="bg-white p-2 rounded-xl shadow-xs mb-4">
                            <QRCodeSVG
                              id={`qr-${table.id}`}
                              value={scanUrl}
                              size={140}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 w-full mt-auto">
                            <button
                              onClick={() => downloadQR(table, shop.slug)}
                              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-full bg-[#f5f5f7] text-xs font-semibold hover:bg-neutral-200"
                            >
                              <Download className="w-3.5 h-3.5" /> Save
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table.id, shop.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 shrink-0"
                              title="Delete Table"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Hidden Print Container */}
      <div className="hidden">
        <div ref={printRef} className="print-container">
          {shops.map((shop) => (
            <div key={`print-${shop.id}`} style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{shop.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {shop.tables.map((table) => {
                  const scanUrl = typeof window !== 'undefined' ? `${window.location.origin}/scan?outlet_id=${shop.id}&table_id=${table.id}` : '';
                  return (
                    <div key={`print-qr-${table.id}`} style={{ border: '2px solid #eaeaea', padding: '20px', borderRadius: '16px', textAlign: 'center', width: '200px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Table {table.table_number}</h3>
                      <QRCodeSVG value={scanUrl} size={160} level="H" />
                      <p style={{ fontSize: '10px', color: '#666', marginTop: '15px', marginBottom: 0 }}>Scan to order</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
