import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
  Link2,
  Pencil,
  Plus,
  Route,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import {
  addCampaignLink,
  createCampaign,
  createCampaignRule,
  deleteCampaign,
  deleteCampaignRule,
  getCampaign,
  listCampaigns,
  removeCampaignLink,
  updateCampaign,
  updateCampaignRule,
  type Campaign,
  type CampaignDetail,
  type CampaignRule,
  type CampaignRuleCondition,
  type CampaignRuleType,
  type EditableCampaignStatus,
} from '../../api/campaigns';
import { listLinks, type ShortenedLink } from '../../api/links';
import './CampaignsPage.css';

gsap.registerPlugin(useGSAP);

const statusLabel: Record<Campaign['status'], string> = {
  active: 'Live',
  draft: 'Draft',
  paused: 'Paused',
  expired: 'Expired',
};

const conditionLabel: Record<CampaignRuleType, string> = {
  device: 'Thiết bị',
  country: 'Quốc gia',
  language: 'Ngôn ngữ',
  time: 'Khung giờ',
};

interface CampaignEditor {
  name: string;
  description: string;
  status: EditableCampaignStatus;
  defaultLinkId: string;
}

interface RuleDraft {
  priority: string;
  targetLinkId: string;
  type: CampaignRuleType;
  values: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

const initialEditor: CampaignEditor = {
  name: '',
  description: '',
  status: 'draft',
  defaultLinkId: '',
};

const emptyRule = (targetLinkId = '', priority = 10): RuleDraft => ({
  priority: String(priority),
  targetLinkId,
  type: 'device',
  values: 'mobile',
  startTime: '08:00',
  endTime: '17:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
});

const minuteToTime = (minute = 0): string => {
  const normalized = Math.max(0, Math.min(1439, minute));
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
};

const timeToMinute = (value: string): number => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const normalizeValues = (type: CampaignRuleType, value: string): string[] => {
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (type === 'country') return items.map((item) => item.toUpperCase());
  if (type === 'language') {
    return items.map((item) => {
      const [language, region] = item.split('-');
      return region ? `${language.toLowerCase()}-${region.toUpperCase()}` : language.toLowerCase();
    });
  }
  return items.map((item) => item.toLowerCase());
};

const ruleConditionFromDraft = (draft: RuleDraft): CampaignRuleCondition => {
  if (draft.type === 'time') {
    return {
      type: 'time',
      startMinute: timeToMinute(draft.startTime),
      endMinute: timeToMinute(draft.endTime),
      timezone: draft.timezone.trim() || 'UTC',
    };
  }
  return { type: draft.type, values: normalizeValues(draft.type, draft.values) };
};

const ruleDraftFromRule = (rule: CampaignRule): RuleDraft => ({
  priority: String(rule.priority),
  targetLinkId: rule.targetLinkId,
  type: rule.condition.type,
  values: rule.condition.values?.join(', ') ?? '',
  startTime: minuteToTime(rule.condition.startMinute),
  endTime: minuteToTime(rule.condition.endMinute),
  timezone: rule.condition.timezone ?? 'UTC',
});

const describeCondition = (condition: CampaignRuleCondition): string => {
  if (condition.type === 'time') {
    return `${minuteToTime(condition.startMinute)}–${minuteToTime(condition.endMinute)} · ${condition.timezone}`;
  }
  return condition.values?.join(', ') || 'Chưa cấu hình';
};

export function CampaignsPage() {
  const root = useRef<HTMLDivElement>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [selected, setSelected] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [linkId, setLinkId] = useState('');
  const [editor, setEditor] = useState<CampaignEditor>(initialEditor);
  const [addLinkId, setAddLinkId] = useState('');
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleDraft, setRuleDraft] = useState<RuleDraft>(emptyRule());

  const availableLinks = useMemo(
    () => links.filter((link) => !selected?.linkIds.includes(link.id)),
    [links, selected],
  );

  const loadCampaignDetail = async (id: string) => {
    const detail = await getCampaign(id);
    setSelected(detail);
    setEditor({
      name: detail.name,
      description: detail.description,
      status: detail.status === 'expired' ? 'paused' : detail.status,
      defaultLinkId: detail.defaultLinkId,
    });
    setAddLinkId(links.find((link) => !detail.linkIds.includes(link.id))?.id ?? '');
    setCampaigns((items) => items.map((item) => (item.id === id ? { ...item, ...detail } : item)));
    return detail;
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listCampaigns(),
      listLinks({ limit: 100, status: 'active' }),
    ]).then(([items, available]) => {
      if (cancelled) return;
      setCampaigns(items);
      setLinks(available.links);
      setLinkId(available.links[0]?.id ?? '');
    }).catch(() => {
      if (!cancelled) setError('Không thể tải campaign. Hãy kiểm tra kết nối API và thử lại.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('[data-campaign-enter]', {
      opacity: 0,
      y: 10,
      filter: 'blur(4px)',
      duration: 0.24,
      ease: 'power2.out',
      stagger: 0.045,
    });
  }, { scope: root, dependencies: [loading], revertOnUpdate: true });

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
    } catch {
      setError('Thao tác không thành công. Kiểm tra dữ liệu và thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const selectCampaign = async (id: string) => {
    setError('');
    setNotice('');
    try {
      await loadCampaignDetail(id);
      setShowRuleForm(false);
      setEditingRuleId(null);
    } catch {
      setError('Không thể tải chi tiết campaign.');
    }
  };

  const submitCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !linkId) return;
    await runAction(async () => {
      const campaign = await createCampaign({
        name: name.trim(),
        status: 'draft',
        linkIds: [linkId],
        entryLinkId: linkId,
        defaultLinkId: linkId,
      });
      setCampaigns((items) => [campaign, ...items]);
      setName('');
      setShowCreate(false);
      await loadCampaignDetail(campaign.id);
    }, 'Đã tạo campaign draft.');
  };

  const saveCampaign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !editor.name.trim() || !editor.defaultLinkId) return;
    await runAction(async () => {
      await updateCampaign(selected.id, {
        name: editor.name.trim(),
        description: editor.description.trim(),
        status: editor.status,
        defaultLinkId: editor.defaultLinkId,
      });
      await loadCampaignDetail(selected.id);
    }, 'Đã lưu cấu hình campaign.');
  };

  const removeSelectedCampaign = async () => {
    if (!selected || !window.confirm(`Xóa campaign “${selected.name}”?`)) return;
    const id = selected.id;
    await runAction(async () => {
      await deleteCampaign(id);
      setCampaigns((items) => items.filter((item) => item.id !== id));
      setSelected(null);
    }, 'Đã xóa campaign.');
  };

  const addDestination = async () => {
    if (!selected || !addLinkId) return;
    await runAction(async () => {
      await addCampaignLink(selected.id, addLinkId);
      await loadCampaignDetail(selected.id);
    }, 'Đã thêm destination.');
  };

  const removeDestination = async (destinationId: string) => {
    if (!selected || !window.confirm('Gỡ destination này khỏi campaign?')) return;
    await runAction(async () => {
      await removeCampaignLink(selected.id, destinationId);
      await loadCampaignDetail(selected.id);
    }, 'Đã gỡ destination.');
  };

  const startCreateRule = () => {
    if (!selected) return;
    const nextPriority = selected.rules.reduce((max, rule) => Math.max(max, rule.priority), 0) + 10;
    setEditingRuleId(null);
    setRuleDraft(emptyRule(selected.defaultLinkId, nextPriority));
    setShowRuleForm(true);
  };

  const startEditRule = (rule: CampaignRule) => {
    setEditingRuleId(rule.id);
    setRuleDraft(ruleDraftFromRule(rule));
    setShowRuleForm(true);
  };

  const closeRuleForm = () => {
    setShowRuleForm(false);
    setEditingRuleId(null);
  };

  const saveRule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !ruleDraft.targetLinkId || !Number(ruleDraft.priority)) return;
    const input = {
      priority: Number(ruleDraft.priority),
      targetLinkId: ruleDraft.targetLinkId,
      condition: ruleConditionFromDraft(ruleDraft),
    };
    await runAction(async () => {
      if (editingRuleId) {
        await updateCampaignRule(selected.id, editingRuleId, input);
      } else {
        await createCampaignRule(selected.id, input);
      }
      await loadCampaignDetail(selected.id);
      closeRuleForm();
    }, editingRuleId ? 'Đã cập nhật routing rule.' : 'Đã tạo routing rule.');
  };

  const removeRule = async (ruleId: string) => {
    if (!selected || !window.confirm('Xóa routing rule này?')) return;
    await runAction(async () => {
      await deleteCampaignRule(selected.id, ruleId);
      await loadCampaignDetail(selected.id);
    }, 'Đã xóa routing rule.');
  };

  return (
    <div ref={root} className="campaign-page">
      <PageHeader title="Campaigns" />
      <div className="campaign-purpose" data-campaign-enter>
        <Route size={18} />
        <p><strong>Một entry link, nhiều hành trình.</strong> Campaign tự chọn destination theo thiết bị, quốc gia, ngôn ngữ hoặc thời gian mà không cần đổi QR.</p>
      </div>

      {(error || notice) && (
        <div className={error ? 'campaign-feedback is-error' : 'campaign-feedback is-success'} role="status">
          {error && <CircleAlert size={16} />}
          {error || notice}
        </div>
      )}

      <div className="campaign-layout">
        <section className="campaign-list-panel" data-campaign-enter>
          <div className="campaign-list-head">
            <div><span className="campaign-eyebrow">CAMPAIGN LIBRARY</span><h2>Điều phối traffic</h2></div>
            <button className="campaign-icon-button" title="Tạo campaign" onClick={() => setShowCreate((value) => !value)}><Plus size={18} /></button>
          </div>

          {showCreate && (
            <form className="campaign-create" onSubmit={submitCampaign}>
              <label>Tên campaign<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Summer launch" autoFocus /></label>
              <label>Entry link<select value={linkId} onChange={(event) => setLinkId(event.target.value)}>{links.map((link) => <option key={link.id} value={link.id}>{link.title || link.shortUrl}</option>)}</select></label>
              <button className="campaign-primary" disabled={busy || !linkId}>{busy ? 'Đang tạo...' : 'Tạo draft'}</button>
            </form>
          )}

          {loading ? <p className="campaign-state">Đang tải campaign...</p> : campaigns.length === 0 ? (
            <div className="campaign-empty"><Route size={24} /><strong>Chưa có campaign</strong><span>Tạo campaign đầu tiên từ một link đang hoạt động.</span></div>
          ) : (
            <div className="campaign-rail">{campaigns.map((campaign) => (
              <button key={campaign.id} className={`campaign-row ${selected?.id === campaign.id ? 'is-selected' : ''}`} onClick={() => void selectCampaign(campaign.id)}>
                <span className={`campaign-status status-${campaign.status}`} />
                <span className="campaign-row-copy"><strong>{campaign.name}</strong><small>{campaign.linkIds.length} link · {statusLabel[campaign.status]}</small></span>
                <ChevronRight size={17} />
              </button>
            ))}</div>
          )}
        </section>

        <section className="campaign-detail-panel" data-campaign-enter>
          {selected ? (
            <>
              <div className="campaign-detail-head">
                <div><span className="campaign-eyebrow">{statusLabel[selected.status]} CAMPAIGN</span><h2>{selected.name}</h2><p>{selected.description || 'Chưa có mô tả cho campaign này.'}</p></div>
                <div className="campaign-head-actions">
                  <Link to={`/dashboard/campaign-operations?campaign=${selected.id}`} className="campaign-ghost"><ArrowUpRight size={16} />Operations</Link>
                  <button className="campaign-danger-icon" title="Xóa campaign" onClick={() => void removeSelectedCampaign()} disabled={busy}><Trash2 size={16} /></button>
                </div>
              </div>

              <form className="campaign-settings" onSubmit={saveCampaign}>
                <label>Tên<input value={editor.name} onChange={(event) => setEditor((value) => ({ ...value, name: event.target.value }))} /></label>
                <label>Trạng thái<select value={editor.status} onChange={(event) => setEditor((value) => ({ ...value, status: event.target.value as EditableCampaignStatus }))}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
                <label className="campaign-field-wide">Mô tả<input value={editor.description} onChange={(event) => setEditor((value) => ({ ...value, description: event.target.value }))} placeholder="Mục tiêu và nguồn traffic của campaign" /></label>
                <label>Default destination<select value={editor.defaultLinkId} onChange={(event) => setEditor((value) => ({ ...value, defaultLinkId: event.target.value }))}>{selected.links.map((link) => <option key={link.id} value={link.id}>{link.title || link.shortUrl}</option>)}</select></label>
                <button className="campaign-save" disabled={busy}><Save size={15} />Lưu cấu hình</button>
              </form>

              <div className="campaign-metrics">
                <div><Activity size={17} /><span>Routing rules</span><strong>{selected.rules.length}</strong></div>
                <div><Link2 size={17} /><span>Destinations</span><strong>{selected.links.length}</strong></div>
              </div>

              <div className="campaign-detail-grid">
                <div>
                  <div className="campaign-section-title"><SlidersHorizontal size={16} /><span>Routing rules</span><button title="Thêm rule" onClick={startCreateRule}><Plus size={15} /></button></div>
                  {showRuleForm && (
                    <form className="campaign-rule-form" onSubmit={saveRule}>
                      <div className="campaign-form-heading"><strong>{editingRuleId ? 'Sửa routing rule' : 'Routing rule mới'}</strong><button type="button" title="Đóng" onClick={closeRuleForm}><X size={15} /></button></div>
                      <label>Priority<input type="number" min="1" max="1000" value={ruleDraft.priority} onChange={(event) => setRuleDraft((value) => ({ ...value, priority: event.target.value }))} /></label>
                      <label>Điều kiện<select value={ruleDraft.type} onChange={(event) => setRuleDraft((value) => ({ ...value, type: event.target.value as CampaignRuleType }))}><option value="device">Thiết bị</option><option value="country">Quốc gia</option><option value="language">Ngôn ngữ</option><option value="time">Khung giờ</option></select></label>
                      {ruleDraft.type === 'time' ? (
                        <><label>Bắt đầu<input type="time" value={ruleDraft.startTime} onChange={(event) => setRuleDraft((value) => ({ ...value, startTime: event.target.value }))} /></label><label>Kết thúc<input type="time" value={ruleDraft.endTime} onChange={(event) => setRuleDraft((value) => ({ ...value, endTime: event.target.value }))} /></label><label className="campaign-field-wide">Timezone<input value={ruleDraft.timezone} onChange={(event) => setRuleDraft((value) => ({ ...value, timezone: event.target.value }))} /></label></>
                      ) : (
                        <label className="campaign-field-wide">Giá trị<input value={ruleDraft.values} onChange={(event) => setRuleDraft((value) => ({ ...value, values: event.target.value }))} placeholder={ruleDraft.type === 'device' ? 'mobile, tablet' : ruleDraft.type === 'country' ? 'VN, US' : 'vi, en-US'} /></label>
                      )}
                      <label className="campaign-field-wide">Destination<select value={ruleDraft.targetLinkId} onChange={(event) => setRuleDraft((value) => ({ ...value, targetLinkId: event.target.value }))}>{selected.links.map((link) => <option key={link.id} value={link.id}>{link.title || link.shortUrl}</option>)}</select></label>
                      <button className="campaign-primary campaign-field-wide" disabled={busy}>{editingRuleId ? 'Cập nhật rule' : 'Tạo rule'}</button>
                    </form>
                  )}
                  {selected.rules.length ? selected.rules.map((rule) => (
                    <div className="campaign-rule" key={rule.id}>
                      <span>#{rule.priority}</span>
                      <div><p>{conditionLabel[rule.condition.type]} <strong>{describeCondition(rule.condition)}</strong></p><small>→ {selected.links.find((link) => link.id === rule.targetLinkId)?.title || 'Destination không khả dụng'}</small></div>
                      <div className="campaign-row-actions"><button title="Sửa rule" onClick={() => startEditRule(rule)}><Pencil size={14} /></button><button title="Xóa rule" onClick={() => void removeRule(rule.id)} disabled={busy}><Trash2 size={14} /></button></div>
                    </div>
                  )) : <p className="campaign-muted">Chưa có rule. Traffic hiện đi qua default destination.</p>}
                </div>

                <div>
                  <div className="campaign-section-title"><Link2 size={16} /><span>Destinations</span></div>
                  {availableLinks.length > 0 && <div className="campaign-add-link"><select value={addLinkId} onChange={(event) => setAddLinkId(event.target.value)}>{availableLinks.map((link) => <option key={link.id} value={link.id}>{link.title || link.shortUrl}</option>)}</select><button title="Thêm destination" onClick={() => void addDestination()} disabled={busy || !addLinkId}><Plus size={16} /></button></div>}
                  {selected.links.map((destination) => {
                    const required = destination.id === selected.entryLinkId || destination.id === selected.defaultLinkId;
                    return <div className="campaign-destination" key={destination.id}><div><span>{destination.title || 'Untitled link'}</span><small>{destination.shortUrl}</small></div><div className="campaign-destination-meta">{destination.id === selected.entryLinkId && <em>Entry</em>}{destination.id === selected.defaultLinkId && <em>Default</em>}<button title={required ? 'Entry và default không thể gỡ' : 'Gỡ destination'} disabled={required || busy} onClick={() => void removeDestination(destination.id)}><X size={14} /></button></div></div>;
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="campaign-detail-empty"><Route size={28} /><h2>Chọn một campaign</h2><p>Xem và vận hành rules, destinations và trạng thái tại một nơi.</p></div>
          )}
        </section>
      </div>
    </div>
  );
}
