// ========================================
// 人物集 — 卡片网格 ｜ 书脊 ｜ 详情面板
// ========================================

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Character, CharacterTag } from '@/types'
import { ColorPicker } from '@/components/Common/ColorPicker'
import { CHAR_ICONS, renderCharIcon, isImageIcon } from '@/components/Common/CharacterIcons'
import { ImageCropModal } from '@/components/Common/ImageCropModal'
import { GOLD, GOLD_LIGHT, darken } from '@/utils/color'


export function CharacterList() {
  const currentWorldId = useAppStore((s) => s.currentWorldId)
  const characters = useAppStore((s) => s.characters)
  const characterTags = useAppStore((s) => s.characterTags)
  const addCharacter = useAppStore((s) => s.addCharacter)
  const updateCharacter = useAppStore((s) => s.updateCharacter)
  const deleteCharacter = useAppStore((s) => s.deleteCharacter)

  const navigateTo = useAppStore((s) => s.navigateTo)
  const goBack = useAppStore((s) => s.goBack)

  const worldCharacters = useMemo(() => characters.filter((c) => c.worldId === currentWorldId), [characters, currentWorldId])
  const worldTags = useMemo(() => characterTags.filter((t) => t.worldId === currentWorldId), [characterTags, currentWorldId])

  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Character | null>(null)
  const [showCreate, setShowCreate] = useState(false)


  const filtered = useMemo(() => {
    let results = worldCharacters.filter((c) => !!c.name)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      results = results.filter((c) =>
        c.name.toLowerCase().includes(q) || (c.identity||'').toLowerCase().includes(q)
        || (c.race||'').toLowerCase().includes(q) || (c.description||'').toLowerCase().includes(q)
      )
    }
    if (filterTag) results = results.filter((c) => c.tags.some((t) => t.name === filterTag))
    results.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    return results
  }, [worldCharacters, search, filterTag])

  const selected = selectedId ? worldCharacters.find((c) => c.id === selectedId) : undefined
  const primaryColor = (c: Character) => c.tags[0]?.color || '#000000'

  return (
    <div style={{ display:'flex', height:'100%', position:'relative' }}>

      {/* ═══════ 左侧：卡片网格 ═══════ */}
      <div style={{
        flex:'0 0 50%', minWidth:0, display:'flex', flexDirection:'column',
        padding:'20px 24px', overflow:'hidden',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
          <h2 style={{ fontSize:'18px', color:GOLD, margin:0, letterSpacing:'2px' }}>人物集</h2>
          <div onClick={goBack} style={{ padding:'4px 10px', borderRadius:'5px', cursor:'pointer',
            fontSize:'12px', color:'var(--color-text-light)', border:'1px solid var(--color-page-shadow)' }}>
            ← 返回
          </div>
        </div>

        <input className="input" placeholder="搜索人物..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom:'8px', fontSize:'13px', padding:'7px 12px' }} />

        {/* 标签过滤 */}
        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginBottom:'10px' }}>
          <div onClick={() => setFilterTag('')} style={{
            padding:'3px 9px', borderRadius:'5px', cursor:'pointer', fontSize:'11px', fontWeight:400,
            color: filterTag===''?GOLD:'var(--color-text-light)',
            background: filterTag===''?'rgba(184,134,11,0.12)':'transparent',
            border:'1px solid', borderColor: filterTag===''?GOLD:'var(--color-page-shadow)',
          }}>全部</div>
          {worldTags.map((t) => (
            <div key={t.id} onClick={() => setFilterTag(filterTag===t.name?'':t.name)} style={{
              padding:'3px 9px', borderRadius:'5px', cursor:'pointer', fontSize:'11px', fontWeight:400,
              color: filterTag===t.name?GOLD:'var(--color-text-light)',
              background: filterTag===t.name?`${t.color}18`:'transparent',
              border:'1px solid', borderColor: filterTag===t.name?t.color:'var(--color-page-shadow)',
            }}>{t.name}</div>
          ))}
        </div>

        <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginBottom:'8px' }}>
          {filtered.length} 个人物
        </div>

        {/* 卡片网格 */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%',
              color:'var(--color-text-muted)', fontSize:'13px' }}>暂无匹配的人物</div>
          ) : (
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(2, 1fr)',
              gap:'12px', alignContent:'start',
            }}>
              {filtered.map((c) => {
                const active = c.id === selectedId
                const pc = primaryColor(c)
                return (
                  <div key={c.id}
                    onClick={() => setSelectedId(active ? null : c.id)}
                    onDoubleClick={() => setEditing(c)}
                    style={{
                      background: active ? `${pc}14` : 'rgba(245,230,200,0.35)',
                      border:'1.5px solid transparent', borderColor: active ? pc : 'var(--color-page-shadow)',
                      borderRadius:'10px', padding:'16px 14px', cursor:'pointer',
                      display:'flex', flexDirection:'column', gap:'4px',
                      position:'relative', overflow:'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = pc
                      e.currentTarget.style.boxShadow = `0 3px 12px rgba(0,0,0,0.06), 0 0 8px ${pc}22`
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'var(--color-page-shadow)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.background = 'rgba(245,230,200,0.35)'
                      } else {
                        e.currentTarget.style.borderColor = pc
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}>
                    {/* 顶部色条 */}
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'2.5px',
                      background:pc, borderRadius:'10px 10px 0 0', opacity:0.6 }} />

                    {/* 图标 + 人物名 */}
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px' }}>
                      {c.icon ? (isImageIcon(c.icon) ? (
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${darken(pc,0.3)}`, flexShrink:0 }}>
                          <img src={c.icon} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                        </div>
                      ) : (
                        <svg viewBox="-10 -10 20 20" width="36" height="36" style={{ flexShrink:0 }}>
                          {renderCharIcon(c.icon, 10, pc)}
                        </svg>
                      )) : (
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:pc, flexShrink:0,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'14px', fontWeight:700, color:'#f5e6c8' }}>{c.name.charAt(0)}</div>
                      )}
                      <div style={{
                        fontSize:'15px', fontWeight:600, color:'var(--color-text)',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>{c.name}</div>
                    </div>

                    {/* 身份 */}
                    {c.identity && (
                      <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{c.identity}</div>
                    )}

                    {/* 标签徽章 */}
                    <div style={{ display:'flex', gap:'3px', flexWrap:'wrap', marginTop:'auto' }}>
                      {c.tags.slice(0, 3).map((t) => (
                        <span key={t.id} style={{ fontSize:'10px', padding:'2px 6px', borderRadius:'4px',
                          color:t.color, background:`${t.color}12`, border:`1px solid ${t.color}33`,
                        }}>{t.name}</span>
                      ))}
                      {c.tags.length > 3 && (
                        <span style={{ fontSize:'9px', color:'var(--color-text-muted)' }}>+{c.tags.length-3}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>


        <div style={{ paddingTop:'10px' }}>
          <div onClick={() => setShowCreate(true)} style={{
            padding:'9px 14px', borderRadius:'8px', cursor:'pointer',
            border:`1.5px dashed ${GOLD}55`, color:GOLD, fontSize:'13px',
            fontWeight:600, textAlign:'center',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(184,134,11,0.08)'; e.currentTarget.style.borderColor=GOLD_LIGHT }}
            onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=`${GOLD}55` }}>
            + 创建新人物
          </div>
          <div onClick={() => navigateTo('tagManagement', '分类标签管理')} style={{
            padding:'8px 14px', borderRadius:'8px', cursor:'pointer', marginTop:'4px',
            border:'1.5px solid rgba(139,105,20,0.25)', color:'var(--color-text-light)', fontSize:'12px',
            fontWeight:400, textAlign:'center',
          }}>
            分类标签管理
          </div>
        </div>
      </div>

      {/* ═══════ 书脊 ═══════ */}
      <div style={{ width:'3px', flexShrink:0,
        background:'linear-gradient(90deg, #8b6914, #4a3728 50%, #8b6914)',
        boxShadow:'0 0 8px rgba(0,0,0,0.3), inset 0 0 4px rgba(0,0,0,0.2)' }} />
      <div style={{ position:'absolute', top:0, bottom:0, left:'calc(50% - 8px)', width:'16px',
        background:'linear-gradient(90deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 100%)',
        pointerEvents:'none', zIndex:1 }} />

      {/* ═══════ 右侧详情 ═══════ */}
      <div style={{
        flex:'0 0 50%', minWidth:0, padding:'24px 28px', display:'flex', flexDirection:'column', overflowY:'auto', overflowX:'hidden',
      }}>
        {!selected ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--color-text-muted)', fontSize:'14px' }}>从左侧选择人物查看详情</div>
        ) : (
          <>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
              {selected.tags.map((t) => (
                <span key={t.id} style={{ padding:'3px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:500,
                  color:t.color, background:`${t.color}14`, border:`1px solid ${t.color}44` }}>{t.name}</span>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                {selected.icon ? (isImageIcon(selected.icon) ? (
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', border:`2px solid ${darken(primaryColor(selected),0.3)}`, flexShrink:0 }}>
                    <img src={selected.icon} alt={selected.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </div>
                ) : (
                  <svg viewBox="-10 -10 20 20" width="40" height="40" style={{ flexShrink:0 }}>
                    {renderCharIcon(selected.icon, 10, primaryColor(selected))}
                  </svg>
                )) : (
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:primaryColor(selected), flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'14px', fontWeight:700, color:'#f5e6c8', border:`2px solid ${darken(primaryColor(selected),0.3)}` }}>{selected.name.charAt(0)}</div>
                )}
                <h2 style={{ fontSize:'22px', fontWeight:700, color:'var(--color-text)', margin:0 }}>{selected.name}</h2>
              </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
              {[['身份',selected.identity],['种族',selected.race],['出生地',selected.birthplace],['年龄',selected.age],['出生日期',selected.birthDate],['实力',selected.power],['称号',selected.title]].filter(([,v])=>v).map(([l,v])=>(
                <div key={l} style={{ display:'flex', gap:'12px', fontSize:'14px' }}>
                  <span style={{ color:'var(--color-text-muted)', minWidth:'70px', fontWeight:500 }}>{l}</span>
                  <span style={{ color:'var(--color-text)' }}>{v as string}</span>
                </div>
              ))}

            </div>
            <div style={{ flex:1, fontSize:'14px', color:'var(--color-text-light)', lineHeight:'1.8', whiteSpace:'pre-wrap', marginBottom:'12px' }}>
              {selected.description || '暂无描述'}
            </div>
            <div style={{ display:'flex', gap:'10px', paddingTop:'8px', marginTop:'4px' }}>
              <button className="btn btn-primary" style={{ fontSize:'13px', padding:'6px 16px' }} onClick={() => setEditing(selected)}>编辑</button>
              <button className="btn btn-danger" style={{ fontSize:'13px', padding:'6px 16px', marginLeft:'auto' }}
                onClick={() => { if(confirm(`删除「${selected.name}」？`)) { deleteCharacter(selected.id); setSelectedId(null) }}}>删除</button>
            </div>
          </>
        )}
      </div>

      {/* ═══ 弹窗 ═══ */}
      {showCreate && <CharacterEditorModal character={{ id:'',worldId:currentWorldId!,name:'',tags:[] } as Character}
        tags={worldTags} onSave={(c) => { addCharacter(c); setShowCreate(false) }} onClose={() => setShowCreate(false)} />}
      {editing && <CharacterEditorModal character={editing} tags={worldTags}
        onSave={(c) => { updateCharacter(c.id, { name:c.name, icon:c.icon, identity:c.identity, race:c.race, birthplace:c.birthplace, age:c.age, birthDate:c.birthDate, power:c.power, title:c.title, tags:c.tags, description:c.description }); setEditing(null) }}
        onDelete={() => { if(confirm(`删除「${editing.name}」？`)) { deleteCharacter(editing.id); setEditing(null); setSelectedId(null) }}}
        onClose={() => setEditing(null)} />}

    </div>
  )
}

// ═══ 人物编辑器 ═══
function CharacterEditorModal({ character, tags, onSave, onDelete, onClose }: {
  character: Character; tags: CharacterTag[]; onSave: (c: Character) => void; onDelete?: () => void; onClose: () => void;
}) {
  const isNew = !character.id
  const [nm,setNm] = useState(character.name)
  const [identity,setIdentity] = useState(character.identity||'')
  const [race,setRace] = useState(character.race||'')
  const [birthplace,setBirthplace] = useState(character.birthplace||'')
  const [age,setAge] = useState(character.age||'')
  const [birthDate,setBirthDate] = useState(character.birthDate||'')
  const [power,setPower] = useState(character.power||'')
  const [title,setTitle] = useState(character.title||'')
  const [desc,setDesc] = useState(character.description||'')
  const [icon,setIcon] = useState(character.icon||'')
  const [selTags,setSelTags] = useState<CharacterTag[]>(character.tags||[])
  const [showCrop, setShowCrop] = useState(false)
  const addCharacterTag = useAppStore((s) => s.addCharacterTag)

  const handleSave = () => { if (!nm.trim()) return; onSave({ ...character, name:nm.trim(), icon:icon||undefined, identity, race, birthplace, age, birthDate, power, title, tags:selTags, description:desc }) }

  const unselectedLibTags = tags.filter((t) => !selTags.find((st) => st.name === t.name))

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth:'600px', width:'92%', maxHeight:'90vh', overflowY:'auto', overflowX:'hidden' }}>
        <h2>{isNew?'创建人物':'编辑人物'}</h2>

        {/* ═══ 人物图标 — 16预设 + 导入/替换 ═══ */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', marginBottom: '10px' }}>人物图标</label>

          {/* 当前预览 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            {icon ? (isImageIcon(icon) ? (
              <div style={{ width:'48px', height:'48px', borderRadius:'10px', overflow:'hidden', border:`2px solid ${GOLD}`, flexShrink:0 }}>
                <img src={icon} alt="图标" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
            ) : (
              <svg viewBox="-10 -10 20 20" width="42" height="42" style={{ flexShrink:0 }}>
                {renderCharIcon(icon, 10, GOLD)}
              </svg>
            )) : (
              <div style={{ width:'48px', height:'48px', borderRadius:'10px', flexShrink:0,
                background:'rgba(245,230,200,0.3)', border:'1.5px dashed var(--color-page-shadow)',
                display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-text-muted)', fontSize:'18px' }}>◇</div>
            )}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'13px', color:'var(--color-text-muted)', marginBottom:'6px' }}>
                {icon ? '选择一个预设图标或导入自定义图片' : '选择一个预设图标或导入自定义图片'}
              </div>
              <div style={{ display:'flex', gap:'6px' }}>
                <button className="btn btn-primary" style={{ fontSize:'12px', padding:'5px 12px' }}
                  onClick={() => setShowCrop(true)}>
                  {icon ? '替换图片' : '导入图片'}
                </button>
                {icon && (
                  <button className="btn" style={{ fontSize:'12px', padding:'5px 12px' }}
                    onClick={() => setIcon('')}>移除图标</button>
                )}
              </div>
            </div>
          </div>

          {/* 16预设图标网格 */}
          <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
            {CHAR_ICONS.map((opt) => {
              const active = opt.key === icon
              return (
                <div key={opt.key} onClick={() => setIcon(opt.key === icon ? '' : opt.key)}
                  title={opt.label}
                  style={{ width:'34px', height:'34px', borderRadius:'8px',
                    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                    border: active ? `2px solid ${GOLD_LIGHT}` : '1.5px solid rgba(139,105,20,0.3)',
                    background: active ? 'rgba(184,134,11,0.12)' : 'rgba(245,230,200,0.3)',
                    boxShadow: active ? `0 0 8px ${GOLD}44` : 'none',
                    transition:'all 0.15s ease', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                  <svg viewBox="-10 -10 20 20" width="18" height="18">
                    {renderCharIcon(opt.key, 7, GOLD)}
                  </svg>
                </div>
              )
            })}
          </div>
        </div>
        {/* 名称 */}
        <div className="form-group"><label>人物名称 *</label><input className="input" value={nm} onChange={(e) => setNm(e.target.value)} autoFocus placeholder={isNew?'输入人物姓名...':''} style={{ fontSize:'15px', padding:'10px 14px' }} /></div>
        <div style={{ display:'flex', gap:'16px' }}>
          <div className="form-group" style={{ flex:1 }}><label>身份</label><input className="input" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="如：国王、骑士..." style={{ fontSize:'14px' }} /></div>
          <div className="form-group" style={{ flex:1 }}><label>种族</label><input className="input" value={race} onChange={(e) => setRace(e.target.value)} placeholder="如：人类、精灵..." style={{ fontSize:'14px' }} /></div>
        </div>
        <div style={{ display:'flex', gap:'16px' }}>
          <div className="form-group" style={{ flex:1 }}><label>出生地</label><input className="input" value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="出生地点..." style={{ fontSize:'14px' }} /></div>
          <div className="form-group" style={{ flex:1 }}><label>年龄</label><input className="input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="如：28" style={{ fontSize:'14px' }} /></div>
        </div>
        <div style={{ display:'flex', gap:'16px' }}>
          <div className="form-group" style={{ flex:1 }}><label>出生日期</label><input className="input" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="如：星坠纪元1380年" style={{ fontSize:'14px' }} /></div>
          <div className="form-group" style={{ flex:1 }}><label>实力</label><input className="input" value={power} onChange={(e) => setPower(e.target.value)} placeholder="如：剑圣、大魔导师..." style={{ fontSize:'14px' }} /></div>
        </div>
        <div className="form-group"><label>称号</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：北境之王..." style={{ fontSize:'14px' }} /></div>
        <div className="form-group"><label>描述</label>
          <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="人物背景描述..." rows={4} style={{ resize:'vertical', fontFamily:'inherit', fontSize:'14px', padding:'10px 14px' }} />
        </div>

        {/* ═══ 分类标签 — 两栏布局 + 拖拽排序 ═══ */}
        <div className="form-group">
          <label style={{ fontSize:'14px', marginBottom:'10px' }}>分类标签</label>
          <div style={{ display:'flex', gap:'14px' }}>
            {/* 左栏：已添加 */}
            <div style={{ flex:1, minWidth:0, border:'1.5px solid var(--color-page-shadow)', borderRadius:'10px', padding:'12px', background:'rgba(245,230,200,0.2)' }}>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'8px', fontWeight:600 }}>
                已添加 <span style={{ fontWeight:400 }}>({selTags.length})</span>
                <span style={{ fontSize:'10px', marginLeft:'4px', opacity:0.6 }}>点击移出 · ↕拖拽排序</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px', minHeight:'36px' }}>
                {selTags.length===0 ? (
                  <span style={{ fontSize:'12px', color:'var(--color-text-muted)', fontStyle:'italic', padding:'4px' }}>点击右侧标签添加</span>
                ) : (
                  selTags.map((t, idx) => (
                    <div key={t.name + idx} draggable
                      onDragStart={(e) => { e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/tag-index', String(idx)) }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect='move' }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromIdx = parseInt(e.dataTransfer.getData('text/tag-index'))
                        if (fromIdx===idx||isNaN(fromIdx)) return
                        const newTags = [...selTags]; const [moved] = newTags.splice(fromIdx,1); newTags.splice(idx,0,moved); setSelTags(newTags)
                      }}
                      style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 10px', borderRadius:'8px',
                        background:`${t.color}18`, border:`1px solid ${t.color}44`, cursor:'grab', fontSize:'13px', fontWeight:600, color:t.color }}
                      onMouseEnter={(ev)=>{ev.currentTarget.style.background=`${t.color}30`;ev.currentTarget.style.borderColor=t.color}}
                      onMouseLeave={(ev)=>{ev.currentTarget.style.background=`${t.color}18`;ev.currentTarget.style.borderColor=`${t.color}44`}}>
                      <span style={{ width:'10px',height:'10px',borderRadius:'50%',background:t.color,border:`1.5px solid ${darken(t.color,0.25)}`,flexShrink:0 }} />
                      <span style={{ flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.name}</span>
                      <span onClick={(ev)=>{ev.stopPropagation();setSelTags(selTags.filter((_,i)=>i!==idx))}} style={{ cursor:'pointer',fontSize:'14px',opacity:0.5,lineHeight:1,flexShrink:0 }} title="移出此标签">✕</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* 右栏：未添加 */}
            <div style={{ flex:1, minWidth:0, border:'1.5px solid var(--color-page-shadow)', borderRadius:'10px', padding:'12px', background:'rgba(245,230,200,0.12)', maxHeight:'200px', overflowY:'auto' }}>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'8px', fontWeight:600 }}>
                可选标签 <span style={{ fontWeight:400 }}>({unselectedLibTags.length})</span>
              </div>
              {unselectedLibTags.length===0 ? (
                <span style={{ fontSize:'12px', color:'var(--color-text-muted)', fontStyle:'italic', padding:'4px' }}>没有更多标签可选</span>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  {unselectedLibTags.map((t) => (
                    <div key={t.id} onClick={() => setSelTags([...selTags, t])}
                      style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 10px', borderRadius:'8px', cursor:'pointer',
                        fontSize:'13px', fontWeight:600, color:t.color, background:`${t.color}10`, border:`1px solid ${t.color}22` }}
                      onMouseEnter={(ev)=>{ev.currentTarget.style.background=`${t.color}22`;ev.currentTarget.style.borderColor=`${t.color}55`}}
                      onMouseLeave={(ev)=>{ev.currentTarget.style.background=`${t.color}10`;ev.currentTarget.style.borderColor=`${t.color}22`}}>
                      <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:t.color,border:`1px solid ${darken(t.color,0.2)}`,flexShrink:0 }} />
                      <span style={{ flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.name}</span>
                      <span style={{ fontSize:'13px',opacity:0.35,flexShrink:0 }}>+</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent:'space-between' }}>
          <div>{onDelete && <button className="btn btn-danger" onClick={onDelete}>删除</button>}</div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn" onClick={onClose}>取消</button>
            <button className="btn btn-primary" disabled={!nm.trim()} onClick={handleSave}>{isNew?'创建':'保存'}</button>
          </div>
        </div>

        {/* ═══ 图片裁剪弹窗 ═══ */}
        {showCrop && (
          <ImageCropModal
            onSave={(dataUrl) => { setIcon(dataUrl); setShowCrop(false) }}
            onClose={() => setShowCrop(false)} />
        )}
      </div>
    </div>, document.body
  )
}
