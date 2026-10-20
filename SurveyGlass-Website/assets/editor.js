(() => {
  'use strict';
  const KEY='surveyglass.website.content.v1';
  const $ = id => document.getElementById(id);
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const esc = value => String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const base = clone(window.SURVEYGLASS_DEFAULT_CONTENT || {});
  const knownIds = new Set((base.sections||[]).map(s=>s.id));
  let content = clone(base), activeId = content.sections?.[0]?.id || null, draft = null;
  try { const saved=localStorage.getItem(KEY); if(saved) content=mergeContent(base,JSON.parse(saved)); } catch(e){ console.warn('Could not load saved content',e); }
  function mergeContent(defaults, incoming) {
    if (!incoming || typeof incoming !== 'object') return clone(defaults);
    const result=clone(defaults);
    ['brand','descriptor','contactEmail','contactPhone','contactLocation'].forEach(k=>{if(typeof incoming[k]==='string')result[k]=incoming[k];});
    result.theme={...result.theme,...(incoming.theme||{})};
    if(Array.isArray(incoming.sections)){
      const ordered=[],seen=new Set();
      incoming.sections.forEach(s=>{if(s&&knownIds.has(s.id)&&!seen.has(s.id)){const def=defaults.sections.find(d=>d.id===s.id);ordered.push({...clone(def),...s});seen.add(s.id);}});
      defaults.sections.forEach(s=>{if(!seen.has(s.id))ordered.push(clone(s));}); result.sections=ordered;
    }
    return result;
  }
  function notify(message){const region=$('toastRegion');if(!region)return;const toast=document.createElement('div');toast.className='toast';toast.textContent=message;region.appendChild(toast);setTimeout(()=>toast.remove(),2800);}
  function save({quiet=false}={}){try{localStorage.setItem(KEY,JSON.stringify(content));$('saveStatus').textContent='SAVED LOCALLY';$('bottomStatus').textContent='Saved in this browser. Export site-content.js to publish for everyone.';if(!quiet)notify('Changes saved in this browser.');}catch(e){$('saveStatus').textContent='SAVE FAILED';notify('Browser storage failed. Export a backup before leaving.');}applyTheme();}
  function applyTheme(){const t=content.theme||{};document.documentElement.style.setProperty('--accent',/^#[0-9a-f]{6}$/i.test(t.accent||'')?t.accent:'#7c9dff');document.documentElement.style.setProperty('--accent2',/^#[0-9a-f]{6}$/i.test(t.accent2||'')?t.accent2:'#67e8d4');document.body.classList.toggle('reduce-motion',t.motion==='off');$('glassValue').textContent=`${Number(t.glass)||0}px`;}
  function sectionById(id){return content.sections.find(s=>s.id===id);}
  function selectSection(id){activeId=id;draft=clone(sectionById(id));renderSectionList();renderSectionFields();}
  function labelFor(id){return ({hero:'Hero / landing statement',proof:'Quick benefits row',benefits:'Benefits',features:'Features',workflow:'How it works',experience:'Design & experience',pricing:'Plans & pricing',faq:'FAQ',contact:'Contact us'})[id]||id;}
  function renderSectionList(){
    const list=$('sectionList'); list.innerHTML='';
    content.sections.forEach((section,index)=>{
      const row=document.createElement('div');row.className='section-item';row.draggable=true;row.dataset.id=section.id;
      row.innerHTML=`<span class="drag-handle" aria-hidden="true">⠿</span><button class="section-select" type="button" style="border:0;background:none;text-align:left;min-width:0;padding:0;color:inherit"><strong>${esc(labelFor(section.id))}</strong><small>${esc(section.title||'No heading')} · ${section.visible===false?'hidden':'visible'}</small></button><div class="section-item-actions"><button class="tiny-icon-button" title="Move up" aria-label="Move ${esc(labelFor(section.id))} up" data-move="-1" ${index===0?'disabled':''}>↑</button><button class="tiny-icon-button" title="Move down" aria-label="Move ${esc(labelFor(section.id))} down" data-move="1" ${index===content.sections.length-1?'disabled':''}>↓</button><label class="toggle" title="Show/hide section"><input type="checkbox" data-visible>Show</label></div>`;
      const check=row.querySelector('input[data-visible]');check.checked=section.visible!==false;check.addEventListener('change',()=>{section.visible=check.checked;if(activeId===section.id&&draft)draft.visible=check.checked;renderSectionList();save({quiet:true});});
      row.querySelector('.section-select').addEventListener('click',()=>selectSection(section.id));
      row.querySelectorAll('button[data-move]').forEach(btn=>btn.addEventListener('click',()=>moveSection(section.id,Number(btn.dataset.move))));
      row.addEventListener('dragstart',e=>{row.classList.add('dragging');e.dataTransfer.setData('text/plain',section.id);e.dataTransfer.effectAllowed='move';});
      row.addEventListener('dragend',()=>{row.classList.remove('dragging');document.querySelectorAll('.section-item').forEach(x=>x.classList.remove('drag-over'));});
      row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('drag-over');e.dataTransfer.dropEffect='move';});
      row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));
      row.addEventListener('drop',e=>{e.preventDefault();row.classList.remove('drag-over');const from=e.dataTransfer.getData('text/plain');if(from&&from!==section.id){const oldIndex=content.sections.findIndex(s=>s.id===from);const newIndex=content.sections.findIndex(s=>s.id===section.id);if(oldIndex>-1&&newIndex>-1){const [moved]=content.sections.splice(oldIndex,1);content.sections.splice(newIndex,0,moved);renderSectionList();save({quiet:true});notify('Section order updated.');}}});
      if(section.id===activeId)row.style.borderColor='var(--accent)';list.appendChild(row);
    });
    const visible=content.sections.filter(s=>s.visible!==false).length;$('visibleCount').textContent=`${visible} of ${content.sections.length} visible`;
  }
  function moveSection(id,delta){const i=content.sections.findIndex(s=>s.id===id),j=i+delta;if(i<0||j<0||j>=content.sections.length)return;[content.sections[i],content.sections[j]]=[content.sections[j],content.sections[i]];renderSectionList();save({quiet:true});}
  function field(name,label,value,{full=false,textarea=false,help='',type='text'}={}){
    const id=`field-${name}`;return `<div class="editor-field ${full?'full':''}"><label for="${esc(id)}">${esc(label)}</label>${textarea?`<textarea id="${esc(id)}" data-field="${esc(name)}">${esc(value||'')}</textarea>`:`<input id="${esc(id)}" type="${esc(type)}" data-field="${esc(name)}" value="${esc(value||'')}">`}${help?`<small>${esc(help)}</small>`:''}</div>`;
  }
  function renderSectionFields(){
    const s=draft;if(!s){$('sectionFields').innerHTML='<div class="editor-empty">Choose a section to edit its content.</div>';return;}
    $('activeSectionTitle').textContent=labelFor(s.id);$('activeSectionSub').textContent=`Edit the text and content used by the ${labelFor(s.id).toLowerCase()} section.`;$('sectionTypeBadge').textContent=s.id.toUpperCase();
    let html='<div class="section-fields">';
    html+=field('eyebrow','Small label / eyebrow',s.eyebrow||'');
    if(s.id==='hero') html+=field('title','Main headline',s.title,{full:true,textarea:true,help:'Short lines and a clear promise work best.'});
    else html+=field('title','Section heading',s.title,{full:true,textarea:true});
    html+=field('body','Supporting text',s.body||'',{full:true,textarea:true});
    if(s.id==='hero'){html+=field('primaryCta','Primary button label',s.primaryCta||'');html+=field('secondaryCta','Secondary button label',s.secondaryCta||'');html+=field('bulletsText','Hero trust points (one per line)',(s.bullets||[]).join('\n'),{full:true,textarea:true,help:'Keep each point brief.'});}
    if(s.id==='contact'){html+=field('primaryCta','Contact button label',s.primaryCta||'',{full:true});html+=field('note','Form note / disclaimer',s.note||'',{full:true,textarea:true});}
    html+='</div>';
    if(Array.isArray(s.items)){
      html+='<div class="editor-items"><div class="editor-panel-head"><div><h2>Cards / questions / steps</h2><p>Edit each item and use arrows to reorder.</p></div></div>';
      s.items.forEach((item,i)=>{html+=`<div class="editor-item-card" data-item-index="${i}"><div class="editor-item-title"><strong>${esc(item.title||`Item ${i+1}`)}</strong><div class="section-item-actions"><button type="button" class="tiny-icon-button" data-item-move="-1" data-index="${i}" ${i===0?'disabled':''}>↑</button><button type="button" class="tiny-icon-button" data-item-move="1" data-index="${i}" ${i===s.items.length-1?'disabled':''}>↓</button><button type="button" class="tiny-icon-button" data-item-remove="${i}" aria-label="Remove item">×</button></div></div><div class="section-fields">${field(`item.${i}.title`,'Title / question / step',item.title||'',{full:true})}${field(`item.${i}.description`,'Description / answer',item.description||'',{full:true,textarea:true})}${item.badge!==undefined?field(`item.${i}.badge`,'Small badge label',item.badge||'',{full:true}):''}</div></div>`;});html+='</div>';
    }
    if(Array.isArray(s.plans)){
      html+='<div class="editor-items"><div class="editor-panel-head"><div><h2>Pricing / plan cards</h2><p>Use &quot;Let\'s discuss&quot; until you have approved commercial prices.</p></div></div>';
      s.plans.forEach((item,i)=>{html+=`<div class="editor-item-card" data-plan-index="${i}"><div class="editor-item-title"><strong>${esc(item.title||`Plan ${i+1}`)}</strong><div class="section-item-actions"><button type="button" class="tiny-icon-button" data-plan-move="-1" data-index="${i}" ${i===0?'disabled':''}>↑</button><button type="button" class="tiny-icon-button" data-plan-move="1" data-index="${i}" ${i===s.plans.length-1?'disabled':''}>↓</button><button type="button" class="tiny-icon-button" data-plan-remove="${i}" aria-label="Remove plan">×</button></div></div><div class="section-fields">${field(`plan.${i}.title`,'Plan name',item.title||'')}${field(`plan.${i}.price`,'Price label',item.price||'')}${field(`plan.${i}.description`,'Plan description',item.description||'',{full:true,textarea:true})}${field(`plan.${i}.featuresText`,'Included items (one per line)',(item.features||[]).join('\n'),{full:true,textarea:true})}${field(`plan.${i}.buttonLabel`,'Button label',item.buttonLabel||'') }<div class="editor-field"><label><input type="checkbox" data-plan-featured="${i}" ${item.featured?'checked':''}> Highlight as recommended</label></div></div></div>`;});html+='</div>';
    }
    $('sectionFields').innerHTML=html;
    $('sectionFields').querySelectorAll('[data-field]').forEach(el=>el.addEventListener('input',()=>{const key=el.dataset.field;setDraftField(key,el.value);}));
    $('sectionFields').querySelectorAll('[data-item-move]').forEach(el=>el.addEventListener('click',()=>{const i=Number(el.dataset.index),j=i+Number(el.dataset.itemMove);if(j<0||j>=draft.items.length)return;[draft.items[i],draft.items[j]]=[draft.items[j],draft.items[i]];renderSectionFields();}));
    $('sectionFields').querySelectorAll('[data-item-remove]').forEach(el=>el.addEventListener('click',()=>{draft.items.splice(Number(el.dataset.itemRemove),1);renderSectionFields();}));
    $('sectionFields').querySelectorAll('[data-plan-move]').forEach(el=>el.addEventListener('click',()=>{const i=Number(el.dataset.index),j=i+Number(el.dataset.planMove);if(j<0||j>=draft.plans.length)return;[draft.plans[i],draft.plans[j]]=[draft.plans[j],draft.plans[i]];renderSectionFields();}));
    $('sectionFields').querySelectorAll('[data-plan-remove]').forEach(el=>el.addEventListener('click',()=>{draft.plans.splice(Number(el.dataset.planRemove),1);renderSectionFields();}));
    $('sectionFields').querySelectorAll('[data-plan-featured]').forEach(el=>el.addEventListener('change',()=>{draft.plans[Number(el.dataset.planFeatured)].featured=el.checked;}));
    $('addItemButton').classList.toggle('hidden',!(Array.isArray(s.items)||Array.isArray(s.plans)));
  }
  function setDraftField(key,value){
    if(key==='bulletsText'){draft.bullets=value.split('\n').map(x=>x.trim()).filter(Boolean);return;}
    if(key.includes('.')){const parts=key.split('.');if(parts[0]==='item'){const item=draft.items[Number(parts[1])];if(item)item[parts[2]]=value;}else if(parts[0]==='plan'){const plan=draft.plans[Number(parts[1])];if(plan){const f=parts[2];if(f==='featuresText')plan.features=value.split('\n').map(x=>x.trim()).filter(Boolean);else plan[f]=value;}}return;}
    draft[key]=value;
  }
  function applySection(){if(!draft||!activeId)return;const idx=content.sections.findIndex(s=>s.id===activeId);if(idx<0)return;content.sections[idx]={...content.sections[idx],...clone(draft)};save({quiet:true});renderSectionList();notify('Section updated.');}
  function syncBrandFromInputs(){content.brand=$('brandInput').value.trim()||'SurveyGlass';content.descriptor=$('descriptorInput').value.trim();content.contactEmail=$('contactEmailSetting').value.trim();content.contactPhone=$('contactPhoneSetting').value.trim();content.contactLocation=$('contactLocationSetting').value.trim();content.theme.accent=$('accentColor').value;content.theme.accent2=$('accent2Color').value;content.theme.motion=$('motionSelect').value;content.theme.glass=Number($('glassRange').value);applyTheme();}
  function fillBrandInputs(){ $('brandInput').value=content.brand||'';$('descriptorInput').value=content.descriptor||'';$('contactEmailSetting').value=content.contactEmail||'';$('contactPhoneSetting').value=content.contactPhone||'';$('contactLocationSetting').value=content.contactLocation||'';$('accentColor').value=content.theme.accent||'#7c9dff';$('accent2Color').value=content.theme.accent2||'#67e8d4';$('motionSelect').value=content.theme.motion||'high';$('glassRange').value=content.theme.glass??22;applyTheme();}
  function fileDownload(filename,type,text){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
  function exportJSON(){syncBrandFromInputs();applySection();fileDownload('surveyglass-site-content.json','application/json;charset=utf-8',JSON.stringify(content,null,2));notify('Content JSON downloaded.');}
  function exportJS(){syncBrandFromInputs();applySection();const src='/* SurveyGlass website content — replace assets/site-content.js with this file to publish changes. */\nwindow.SURVEYGLASS_DEFAULT_CONTENT = '+JSON.stringify(content,null,2)+';\n';fileDownload('site-content.js','text/javascript;charset=utf-8',src);notify('Publish file downloaded. Replace assets/site-content.js with this file.');}
  function loadFromObject(obj){content=mergeContent(base,obj);activeId=content.sections?.[0]?.id||null;draft=activeId?clone(sectionById(activeId)):null;fillBrandInputs();renderSectionList();renderSectionFields();save({quiet:true});notify('Content imported. Review and export to publish.');}
  // Brand/theme fields update the live editor theme immediately, but write content only on save/export.
  ['brandInput','descriptorInput','contactEmailSetting','contactPhoneSetting','contactLocationSetting','accentColor','accent2Color','motionSelect','glassRange'].forEach(id=>$(id).addEventListener('input',()=>{syncBrandFromInputs();$('saveStatus').textContent='UNSAVED CHANGES';}));
  $('saveButton').addEventListener('click',()=>{syncBrandFromInputs();applySection();save();});
  $('saveBottomButton').addEventListener('click',()=>{syncBrandFromInputs();applySection();save();});
  $('publishBottomButton').addEventListener('click',exportJS);$('exportJsButton').addEventListener('click',exportJS);$('exportJsButtonBottom').addEventListener('click',exportJS);$('exportJsonButton').addEventListener('click',exportJSON);
  $('saveSectionButton').addEventListener('click',applySection);
  $('addItemButton').addEventListener('click',()=>{if(!draft)return;if(Array.isArray(draft.items)){draft.items.push({title:'New item',description:'Add a short description.'});renderSectionFields();}else if(Array.isArray(draft.plans)){draft.plans.push({title:'New plan',price:"Let's discuss",description:'Describe who this plan is for.',features:['First included item'],buttonLabel:'Ask us',featured:false});renderSectionFields();}applySection();});
  $('previewButton').addEventListener('click',()=>{syncBrandFromInputs();applySection();save({quiet:true});window.open('index.html','_blank','noopener');});
  $('resetButton').addEventListener('click',()=>{if(!confirm('Reset all website content to the bundled defaults? Export a backup first if you need your current edits.'))return;content=clone(base);activeId=content.sections?.[0]?.id||null;draft=clone(sectionById(activeId));localStorage.removeItem(KEY);fillBrandInputs();renderSectionList();renderSectionFields();save({quiet:true});notify('Website content reset to defaults.');});
  $('importButton').addEventListener('click',()=>$('importFile').click());
  $('importFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const json=JSON.parse(await file.text());loadFromObject(json);}catch(err){notify('Could not read that JSON file.');}e.target.value='';});
  $('downloadReadmeButton').addEventListener('click',()=>fileDownload('SurveyGlass-publish-notes.txt','text/plain;charset=utf-8',`SURVEYGLASS WEBSITE PUBLISH NOTES\n\n1. Export site-content.js from the editor.\n2. Replace the existing assets/site-content.js file in the website folder with the exported file.\n3. Upload/redeploy the website folder to your web host.\n4. Test mobile layout, links and the contact form.\n5. Configure a real contact email before publishing. The included static form opens the visitor's email application; it does not send or store form submissions on a server.\n6. The editor stores changes in one browser until you export. For a secure multi-user CMS and server-side publishing, add authentication plus a backend/CMS.\n\nThis site is a static HTML/CSS/JS starter. No payment gateway, account system or server API is configured.\n`));
  // Save controls include edits in the currently active section even if the Apply button was not pressed.
  fillBrandInputs();renderSectionList();renderSectionFields();
})();
