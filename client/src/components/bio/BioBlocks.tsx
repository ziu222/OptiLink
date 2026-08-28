import React, { useState } from 'react';
import { IBlock } from '../../types/bio';
import './bio.css';

interface BioBlocksProps {
  blocks: IBlock[];
}

export const BioBlocks: React.FC<BioBlocksProps> = ({ blocks }) => {
  const [activeTab, setActiveTab] = useState<string | null>(
    blocks.find(b => b.type === 'TAB_GROUP')?.content?.tabs?.[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Lọc blocks theo trạng thái ẩn/hiện
  const visibleBlocks = blocks.filter(b => !b.isHidden).sort((a, b) => a.order - b.order);

  const renderBlock = (block: IBlock) => {
    switch (block.type) {
      case 'SEARCH_BAR':
        return (
          <div key={block.id} className="block-search">
            <input 
              type="text" 
              placeholder={block.content.placeholder || "Tìm kiếm..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        );
        
      case 'CATEGORY_FILTER':
        return (
          <div key={block.id} className="block-categories">
            <button 
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              Tất cả
            </button>
            {block.content.categories?.map((cat: string) => (
              <button 
                key={cat} 
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        );

      case 'TAB_GROUP':
        return (
          <div key={block.id} className="block-tabs">
            {block.content.tabs?.map((tab: any) => (
              <button 
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        );

      case 'PRODUCT_CARD':
        // Nếu block có gán tabId, nhưng không phải tab đang active thì ẩn
        if (block.tabId && block.tabId !== activeTab) return null;
        
        // Logic lọc Category & Search Query
        const matchSearch = block.content.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = activeCategory === 'all' || block.content.category === activeCategory;
        if (!matchSearch || !matchCategory) return null;

        return (
          <a key={block.id} href={`/s/${block.content.shortLinkId || block.id}`} className="block-product" target="_blank" rel="noopener noreferrer">
            <img src={block.content.imageUrl} alt={block.content.title} className="product-img" />
            <div className="product-info">
              <span className="product-title">{block.content.title}</span>
              <span className="product-price">{block.content.price}</span>
            </div>
          </a>
        );

      case 'LINK':
        if (block.tabId && block.tabId !== activeTab) return null;
        return (
          <a key={block.id} href={block.content.url} className="block-link" target="_blank" rel="noopener noreferrer">
            {block.content.label}
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bio-blocks-container">
      {visibleBlocks.map(renderBlock)}
    </div>
  );
};
