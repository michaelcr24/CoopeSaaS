<template>
  <div class="module-page">

    <div v-if="!wizardMode && pageError" class="convoc-estado convoc-pending" style="border-color:#F5C6C0; color:#C0392B;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ pageError }}</span>
    </div>

    <!-- ═══════════════════════════════════════
         VISTA PRINCIPAL (lista)
    ═══════════════════════════════════════ -->
    <template v-if="!wizardMode && !postulacionMode">
      <div class="page-header">
        <div>
          <h2 class="page-title">Asambleas</h2>
          <p class="page-subtitle">Planificación, elecciones y archivo de asambleas</p>
        </div>
        <button class="btn-primary" @click="startWizard()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Programar asamblea
        </button>
      </div>

      <!-- Próxima asamblea -->
      <div class="next-card" v-if="proxima">
        <div class="next-badge">Próxima asamblea</div>
        <div class="next-body">
          <div class="next-date-block">
            <span class="next-day">{{ proxima.day }}</span>
            <span class="next-month">{{ proxima.month }}</span>
          </div>
          <div class="next-info">
            <h3 class="next-title">{{ proxima.name }}</h3>
            <p class="next-meta">{{ proxima.lugar }} · {{ proxima.hora }} · {{ proxima.modalidad }}</p>
          </div>
          <div class="next-step-info">
            <span class="next-step-label">Paso actual</span>
            <span class="next-step-val">{{ steps[proxima.step - 1].label }}</span>
          </div>
          <button class="btn-outline-white" @click="startWizard(proxima)">Continuar proceso</button>
        </div>
      </div>

      <div class="data-card">
        <div class="card-head">
          <h3 class="card-title">Historial de asambleas</h3>
          <div class="header-actions">
            <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportExcel(asambleas,[{key:'name',label:'Asamblea'},{key:'type',label:'Tipo'},{key:'date',label:'Fecha'},{key:'quorum',label:'Quórum %'},{key:'status',label:'Estado'}],'asambleas')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
            </button>
            <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF(asambleas,[{key:'name',label:'Asamblea'},{key:'type',label:'Tipo'},{key:'date',label:'Fecha'},{key:'quorum',label:'Quórum %'},{key:'status',label:'Estado'}],'Historial de Asambleas')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            </button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Asamblea</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Quórum</th>
              <th>Avance</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in asambleas" :key="a.id">
              <td class="cell-bold">{{ a.name }}</td>
              <td><span class="badge badge--blue">{{ a.type }}</span></td>
              <td>{{ a.date }}</td>
              <td>{{ a.quorum ? a.quorum + '%' : '—' }}</td>
              <td>
                <div class="mini-steps">
                  <div
                    v-for="n in 8" :key="n"
                    class="mini-dot"
                    :class="n <= a.step ? 'mini-dot--done' : ''"
                  ></div>
                </div>
              </td>
              <td><span class="badge" :class="`badge--${a.statusClass}`">{{ a.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Abrir proceso" @click="startWizard(a)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══════════════════════════════════════
         WIZARD
    ═══════════════════════════════════════ -->
    <template v-else-if="wizardMode">

      <!-- Encabezado del wizard -->
      <div class="wizard-topbar">
        <div>
          <h2 class="page-title">{{ wizardData.nombre || 'Nueva asamblea' }}</h2>
          <p class="page-subtitle">
            Proceso de planificación · Paso {{ currentStep }} de {{ steps.length }}
            <span v-if="isSupabaseConfigured() && currentAsambleaId" class="draft-status">
              · <span v-if="draftSaving">Guardando borrador…</span><span v-else>Borrador guardado</span>
            </span>
          </p>
        </div>
        <button class="btn-outline-danger" @click="salirWizard">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Salir
        </button>
      </div>

      <div v-if="wizardError" class="convoc-estado convoc-pending" style="border-color:#F5C6C0; color:#C0392B;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>{{ wizardError }}</span>
      </div>
      <div v-if="wizardLoading" class="puestos-empty">Cargando…</div>

      <!-- Barra de pasos -->
      <div class="stepper-wrap">
        <div class="stepper">
          <div
            v-for="(step, idx) in steps"
            :key="step.n"
            class="step-item"
            @click="currentStep > step.n - 1 ? currentStep = step.n : null"
          >
            <div class="step-connector" v-if="idx > 0" :class="currentStep > idx ? 'step-connector--done' : ''"></div>
            <div
              class="step-circle"
              :class="{
                'step-circle--done':    currentStep > step.n,
                'step-circle--active':  currentStep === step.n,
                'step-circle--future':  currentStep < step.n,
                'step-circle--clickable': currentStep > step.n,
              }"
            >
              <svg v-if="currentStep > step.n" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else>{{ step.n }}</span>
            </div>
            <span class="step-label" :class="currentStep === step.n ? 'step-label--active' : ''">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- ─── PASO 1: Datos generales ─── -->
      <div v-if="currentStep === 1" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Datos generales de la asamblea</h3>
            <p class="wcard-desc">Información básica del evento</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="form-row">
            <div class="form-field form-field--full">
              <label>Nombre de la asamblea <span class="req">*</span></label>
              <input v-model="wizardData.nombre" type="text" placeholder="Ej: Asamblea Ordinaria 2026" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Tipo de asamblea <span class="req">*</span></label>
              <select v-model="wizardData.tipo">
                <option value="">Seleccionar</option>
                <option>Ordinaria</option>
                <option>Extraordinaria</option>
                <option>Especial</option>
              </select>
            </div>
            <div class="form-field">
              <label>Modalidad <span class="req">*</span></label>
              <select v-model="wizardData.modalidad">
                <option value="">Seleccionar</option>
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Mixta</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Fecha <span class="req">*</span></label>
              <DatePicker v-model="wizardData.fecha" />
            </div>
            <div class="form-field">
              <label>Hora inicio <span class="req">*</span></label>
              <TimePicker v-model="wizardData.hora" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field form-field--full">
              <label>Lugar / Sede <span class="req">*</span></label>
              <input v-model="wizardData.lugar" type="text" placeholder="Ej: Sede Central, Sala de Reuniones 2" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Quórum requerido (%)</label>
              <input v-model="wizardData.quorumReq" type="number" min="1" max="100" placeholder="50" />
            </div>
            <div class="form-field">
              <label>Convocatoria anticipada (días)</label>
              <input v-model="wizardData.diasConvocatoria" type="number" min="1" placeholder="15" />
            </div>
          </div>
          <div class="form-field form-field--full">
            <label>Agenda / Descripción</label>
            <textarea v-model="wizardData.agenda" rows="4" placeholder="Orden del día, temas principales a tratar..."></textarea>
          </div>
        </div>
      </div>

      <!-- ─── PASO 2: Puestos a elegir ─── -->
      <div v-if="currentStep === 2" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Puestos a elegir</h3>
            <p class="wcard-desc">Selecciona los puestos que estarán vacantes en esta asamblea</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="puestos-grid">
            <div v-for="consejo in consejos" :key="consejo.id" class="consejo-cell">
              <h4 class="consejo-title">{{ consejo.name }}</h4>
              <div class="puesto-rows">
                <label
                  v-for="puesto in consejo.puestos"
                  :key="puesto.id"
                  class="puesto-row"
                  :class="puesto.selected ? 'puesto-row--selected' : ''"
                >
                  <input
                    type="checkbox"
                    v-model="puesto.selected"
                    class="puesto-check"
                  />
                  <div class="puesto-info">
                    <span class="puesto-qty">{{ puesto.cantidad }}</span>
                    <span class="puesto-tipo">{{ puesto.tipo }}</span>
                    <span class="puesto-duracion">por {{ puesto.duracion }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="puestos-summary" v-if="puestosSeleccionados.length">
            <div class="summary-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Puestos seleccionados para elección ({{ puestosSeleccionados.length }})
            </div>
            <div class="summary-chips">
              <span v-for="p in puestosSeleccionados" :key="p.id" class="summary-chip">
                {{ p.consejoName }} · {{ p.cantidad }} {{ p.tipo }}
              </span>
            </div>
          </div>
          <div class="puestos-empty" v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Selecciona al menos un puesto para continuar
          </div>
        </div>
      </div>

      <!-- ─── PASO 3: Convocatoria ─── -->
      <div v-if="currentStep === 3" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Convocatoria</h3>
            <p class="wcard-desc">Define fechas y envía la convocatoria a los asociados</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="form-row">
            <div class="form-field">
              <label>Fecha de publicación <span class="req">*</span></label>
              <DatePicker v-model="wizardData.fechaConvocatoria" />
            </div>
            <div class="form-field">
              <label>Plazo límite de postulaciones <span class="req">*</span></label>
              <DatePicker v-model="wizardData.fechaLimitePostulacion" />
            </div>
          </div>
          <div class="form-field form-field--full">
            <label>Mensaje de convocatoria</label>
            <textarea v-model="wizardData.mensajeConvocatoria" rows="4"
              placeholder="Estimados asociados, se les convoca a la Asamblea..."></textarea>
          </div>

          <div class="convoc-puestos">
            <div class="convoc-puestos-label">Puestos incluidos en la convocatoria</div>
            <div class="convoc-puesto-row" v-for="p in puestosSeleccionados" :key="p.id">
              <div class="convoc-org-dot" :style="{ background: p.color }"></div>
              <div class="convoc-info">
                <span class="convoc-organo">{{ p.consejoName }}</span>
                <span class="convoc-tipo">{{ p.cantidad }} {{ p.tipo }} · {{ p.duracion }}</span>
              </div>
            </div>
          </div>

          <div class="convoc-estado" :class="wizardData.convocatoriaEnviada ? 'convoc-ok' : 'convoc-pending'">
            <template v-if="!wizardData.convocatoriaEnviada">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Convocatoria pendiente de envío</span>
              <button class="btn-primary btn-sm" @click="enviarConvocatoriaClick">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Enviar convocatoria
              </button>
            </template>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Convocatoria enviada correctamente</span>
            </template>
          </div>
        </div>
      </div>

      <!-- ─── PASO 4: Postulaciones ─── -->
      <div v-if="currentStep === 4" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-1.5-3.12M15 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Postulaciones</h3>
            <p class="wcard-desc">Registro de asociados candidatos por puesto</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="postulaciones-list">
            <div v-for="puesto in puestosConPostulantes" :key="puesto.id" class="postulacion-group">
              <div class="postulacion-group-header">
                <div>
                  <span class="postulacion-organo">{{ puesto.consejoName }}</span>
                  <span class="postulacion-tipo-badge">{{ puesto.cantidad }} {{ puesto.tipo }}</span>
                </div>
                <button class="btn-add-slim" @click="openPostulacionModal(puesto)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar postulante
                </button>
              </div>

              <div class="postulantes-table" v-if="puesto.postulantes.length">
                <div class="postulante-row postulante-row--head">
                  <span>Postulante</span><span>Cédula</span><span>Estado</span><span></span>
                </div>
                <div v-for="(p, i) in puesto.postulantes" :key="i" class="postulante-row">
                  <div class="cell-user">
                    <div class="mini-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
                    <span>{{ p.name }}</span>
                  </div>
                  <span class="cell-cedula">{{ p.cedula }}</span>
                  <span class="badge badge--yellow">Inscrito</span>
                  <button class="action-btn-sm action-btn-sm--red" @click="quitarPostulante(puesto, i)" title="Quitar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <div class="postulantes-empty" v-else>Sin postulantes registrados aún</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── PASO 5: Aprobación ─── -->
      <div v-if="currentStep === 5" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Aprobación de postulaciones</h3>
            <p class="wcard-desc">Revisa y aprueba o rechaza cada candidatura</p>
          </div>
        </div>
        <div class="wcard-body">
          <div v-for="puesto in puestosConPostulantes" :key="puesto.id" class="aprobacion-group">
            <div class="aprobacion-header">
              <span class="postulacion-organo">{{ puesto.consejoName }}</span>
              <span class="postulacion-tipo-badge">{{ puesto.cantidad }} {{ puesto.tipo }}</span>
            </div>
            <div v-if="puesto.postulantes.length" class="aprobacion-rows">
              <div v-for="(p, i) in puesto.postulantes" :key="i" class="aprobacion-row">
                <div class="cell-user">
                  <div class="mini-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
                  <span>{{ p.name }}</span>
                </div>
                <span class="cell-cedula">{{ p.cedula }}</span>
                <div class="aprobacion-actions">
                  <button
                    class="apr-btn apr-btn--aprobar"
                    :class="p.estado === 'aprobado' ? 'apr-btn--active-green' : ''"
                    @click="aprobarPostulante(p)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Aprobar
                  </button>
                  <button
                    class="apr-btn apr-btn--rechazar"
                    :class="p.estado === 'rechazado' ? 'apr-btn--active-red' : ''"
                    @click="rechazarPostulante(p)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Rechazar
                  </button>
                </div>
                <span class="badge"
                  :class="p.estado === 'aprobado' ? 'badge--green' : p.estado === 'rechazado' ? 'badge--red' : 'badge--yellow'">
                  {{ p.estado === 'aprobado' ? 'Aprobado' : p.estado === 'rechazado' ? 'Rechazado' : 'Pendiente' }}
                </span>
              </div>
            </div>
            <div class="postulantes-empty" v-else>No hay postulantes para este puesto</div>
          </div>
        </div>
      </div>

      <!-- ─── PASO 6: Ternas ─── -->
      <div v-if="currentStep === 6" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Definición de ternas</h3>
            <p class="wcard-desc">Ordena los candidatos aprobados para conformar la terna por puesto</p>
          </div>
        </div>
        <div class="wcard-body">
          <div v-for="puesto in puestosConPostulantes" :key="puesto.id" class="terna-group">
            <div class="aprobacion-header">
              <span class="postulacion-organo">{{ puesto.consejoName }}</span>
              <span class="postulacion-tipo-badge">{{ puesto.cantidad }} {{ puesto.tipo }}</span>
            </div>
            <div class="terna-aprobados">
              <div class="terna-aprobados-label">Candidatos aprobados → selecciona hasta 3 para la terna</div>
              <div class="terna-candidatos">
                <div
                  v-for="(p, i) in puesto.postulantes.filter(c => c.estado === 'aprobado')"
                  :key="i"
                  class="terna-candidato"
                  :class="{ 'terna-candidato--selected': p.enTerna }"
                  @click="toggleTerna(p)"
                >
                  <div class="mini-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
                  <span class="terna-cand-name">{{ p.name }}</span>
                  <span class="terna-pos" v-if="p.enTerna">
                    #{{ puesto.postulantes.filter(c => c.estado === 'aprobado' && c.enTerna).indexOf(p) + 1 }}
                  </span>
                  <svg v-if="p.enTerna" class="terna-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div v-if="!puesto.postulantes.some(c => c.estado === 'aprobado')" class="postulantes-empty">
                  No hay candidatos aprobados para este puesto
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── PASO 7: Votaciones ─── -->
      <div v-if="currentStep === 7" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Resultados de votaciones</h3>
            <p class="wcard-desc">Resultados registrados en el módulo de Votaciones</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="votaciones-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Las votaciones se realizan en el módulo <strong>Votaciones</strong>. Aquí se muestran los resultados para consulta.
            <button v-if="currentAsambleaId" class="btn-primary btn-sm" @click="irAVotaciones">Gestionar votaciones →</button>
          </div>

          <div v-for="(vot, vi) in votacionesResultados" :key="vi" class="votacion-resultado-group">
            <div class="aprobacion-header">
              <span class="postulacion-organo">{{ vot.titulo }}</span>
              <span class="postulacion-tipo-badge">{{ vot.totalVotos }} votos emitidos</span>
            </div>
            <table class="data-table">
              <thead>
                <tr><th>Candidato</th><th>Votos</th><th>%</th><th>Resultado</th></tr>
              </thead>
              <tbody>
                <tr v-for="c in vot.candidatos" :key="c.nombre">
                  <td>{{ c.nombre }}</td>
                  <td>{{ c.votos }}</td>
                  <td>{{ c.totalVotos > 0 ? Math.round(c.votos / c.totalVotos * 100) : 0 }}%</td>
                  <td>
                    <span v-if="c.electo" class="badge badge--green">ELECTO ✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── PASO 8: Acta ─── -->
      <div v-if="currentStep === 8" class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Acta de la asamblea</h3>
            <p class="wcard-desc">Registro oficial y cierre del proceso</p>
          </div>
        </div>
        <div class="wcard-body">
          <!-- Resumen de electos -->
          <div class="acta-section">
            <div class="acta-section-title">Resultados de elecciones</div>
            <div v-for="puesto in puestosConPostulantes" :key="puesto.id" class="acta-resultado">
              <span class="acta-organo">{{ puesto.consejoName }} · {{ puesto.tipo }}</span>
              <div class="acta-electo" v-if="ganadorDe(puesto)">
                <div class="mini-avatar" :style="{ background: ganadorDe(puesto).color }">{{ ganadorDe(puesto).initials }}</div>
                <span>{{ ganadorDe(puesto).name }}</span>
                <span class="badge badge--green">Electo/a</span>
                <span class="acta-votos">{{ ganadorDe(puesto).votos }} votos</span>
              </div>
              <div class="acta-electo acta-electo--pending" v-else>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Pendiente de votación</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Hora de inicio de la asamblea</label>
              <TimePicker v-model="wizardData.horaInicio" />
            </div>
            <div class="form-field">
              <label>Hora de cierre</label>
              <TimePicker v-model="wizardData.horaCierre" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Total de asociados presentes</label>
              <input v-model="wizardData.asistentes" type="number" />
            </div>
            <div class="form-field">
              <label>Número de acta</label>
              <input v-model="wizardData.numActa" type="text" placeholder="Ej: 001-2026" />
            </div>
          </div>
          <div class="form-field form-field--full">
            <label>Acuerdos adoptados</label>
            <textarea v-model="wizardData.acuerdos" rows="4" placeholder="Listado de acuerdos tomados durante la asamblea..."></textarea>
          </div>
          <div class="form-field form-field--full">
            <label>Observaciones generales</label>
            <textarea v-model="wizardData.observaciones" rows="2" placeholder="Incidencias, puntos de agenda sin resolver..."></textarea>
          </div>

          <!-- Grabación, transcripción y borrador de minuta con IA -->
          <div class="acta-section" v-if="currentAsambleaId">
            <div class="acta-section-title">Grabación y transcripción con IA</div>

            <div v-if="grabacionError" class="convoc-estado convoc-pending" style="border-color:#F5C6C0; color:#C0392B;">
              <span>{{ grabacionError }}</span>
            </div>

            <div class="convoc-estado" :class="grabando && !pausado ? 'convoc-ok' : 'convoc-pending'">
              <template v-if="!grabando && !(grabacion?.audio_segments?.length)">
                <span>Sin grabación iniciada</span>
                <button class="btn-primary btn-sm" @click="iniciarGrabacion">🎙️ Iniciar grabación</button>
              </template>
              <template v-else-if="grabando && !pausado">
                <span>🔴 Grabando… {{ segmentosSubidos }} segmento(s) subido(s)</span>
                <button class="btn-outline btn-sm" @click="pausarGrabacion">⏸ Pausar</button>
                <button class="btn-success btn-sm" @click="finalizarGrabacionClick">⏹ Finalizar grabación</button>
              </template>
              <template v-else-if="grabando && pausado">
                <span>⏸ Pausado — {{ segmentosSubidos }} segmento(s) subido(s)</span>
                <button class="btn-primary btn-sm" @click="reanudarGrabacion">▶ Reanudar</button>
                <button class="btn-success btn-sm" @click="finalizarGrabacionClick">⏹ Finalizar grabación</button>
              </template>
              <template v-else>
                <span>✓ Audio grabado — {{ segmentosSubidos }} segmento(s)</span>
              </template>
            </div>

            <div class="convoc-estado convoc-pending" v-if="grabacion?.audio_segments?.length && !grabando">
              <template v-if="grabacion.estado === 'transcribiendo'">
                <span>Transcribiendo… {{ (grabacion.transcripcion_segmentos || []).filter(s => s.estado === 'ok').length }} / {{ grabacion.audio_segments.length }} segmentos</span>
              </template>
              <template v-else-if="['transcrito','generando_minuta','minuta_lista'].includes(grabacion.estado)">
                <span>✓ Transcripción lista</span>
              </template>
              <template v-else-if="grabacion.estado === 'error_transcripcion'">
                <span>⚠ Error en la transcripción: {{ grabacion.error_detalle }}</span>
                <button class="btn-primary btn-sm" @click="iniciarTranscripcionClick">Reintentar</button>
              </template>
              <template v-else>
                <button class="btn-primary btn-sm" @click="iniciarTranscripcionClick">🧠 Transcribir con IA</button>
              </template>
            </div>

            <div class="convoc-estado convoc-pending" v-if="['transcrito','generando_minuta','minuta_lista','error_minuta'].includes(grabacion?.estado)">
              <template v-if="grabacion.estado === 'generando_minuta'">
                <span>Generando borrador de minuta…</span>
              </template>
              <template v-else-if="grabacion.estado === 'error_minuta'">
                <span>⚠ Error generando la minuta: {{ grabacion.error_detalle }}</span>
                <button class="btn-primary btn-sm" @click="generarMinutaClick">Reintentar</button>
              </template>
              <template v-else-if="grabacion.estado === 'transcrito'">
                <button class="btn-primary btn-sm" @click="generarMinutaClick">✍️ Generar borrador de minuta</button>
              </template>
              <template v-else>
                <span>✓ Borrador de minuta generado</span>
              </template>
            </div>

            <div class="form-field form-field--full" v-if="minutaBorrador">
              <label>Borrador de minuta (generado por IA — revise y edite antes de usarlo como acta oficial)</label>
              <textarea v-model="minutaBorrador" rows="10" placeholder="El borrador generado aparecerá aquí..."></textarea>
            </div>
          </div>

          <div class="form-field form-field--full">
            <label>Adjuntar acta firmada (PDF)</label>
            <div class="file-drop">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7A90A0" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p>Arrastra el acta aquí o <label class="file-link">selecciona el archivo<input type="file" accept=".pdf" hidden /></label></p>
              <small>Solo PDF · máx. 20 MB</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación del wizard -->
      <div class="wizard-nav">
        <button v-if="currentStep > 1" class="btn-outline" @click="currentStep--">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Paso anterior
        </button>
        <div v-else></div>

        <div class="wizard-nav-right">
          <span class="wizard-nav-hint" v-if="currentStep < 8">Paso {{ currentStep }} de {{ steps.length }}</span>
          <button
            v-if="currentStep < 8"
            class="btn-primary"
            :disabled="wizardSaving"
            @click="nextStep"
          >
            Siguiente paso
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button v-else class="btn-success" :disabled="wizardSaving" @click="finalizarAsamblea">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Finalizar asamblea
          </button>
        </div>
      </div>

    </template><!-- fin wizard -->

    <!-- ═══════════════════════════════════════
         VISTA POSTULACIÓN (Asociado)
    ═══════════════════════════════════════ -->
    <template v-else-if="postulacionMode">
      <div class="page-header">
        <div>
          <h2 class="page-title">{{ currentPostulacion?.name ?? 'Asamblea' }}</h2>
          <p class="page-subtitle">{{ currentPostulacion?.date }} · {{ currentPostulacion?.lugar }}</p>
        </div>
        <button class="btn-outline-danger" @click="postulacionMode = false">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver
        </button>
      </div>

      <!-- Mis postulaciones activas -->
      <div class="data-card">
        <div class="card-head"><h3 class="card-title">Mis postulaciones</h3></div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Órgano</th>
              <th>Puesto</th>
              <th>Fecha postulación</th>
              <th>Estado</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in juanPostulaciones.filter(x => x.asamblea === currentPostulacion?.name)" :key="p.id">
              <td>{{ p.consejo }}</td>
              <td><span class="puesto-chip">{{ p.puesto }}</span></td>
              <td>{{ p.fechaPost }}</td>
              <td><span class="badge" :class="`badge--${p.estadoClass}`">{{ p.estado }}</span></td>
              <td class="text-muted-sm">{{ p.obs ?? '—' }}</td>
            </tr>
            <tr v-if="!juanPostulaciones.filter(x => x.asamblea === currentPostulacion?.name).length">
              <td colspan="5" class="empty-row">No tienes postulaciones en esta asamblea.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Formulario: seleccionar puestos nuevos -->
      <div class="wizard-card">
        <div class="wcard-header">
          <div class="wcard-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <h3 class="wcard-title">Postularme en nuevos puestos</h3>
            <p class="wcard-desc">Selecciona los puestos en los que deseas participar como candidato</p>
          </div>
        </div>
        <div class="wcard-body">
          <div class="puestos-grid">
            <div v-for="consejo in consejosPostulacion" :key="consejo.id" class="consejo-cell">
              <h4 class="consejo-title">{{ consejo.name }}</h4>
              <div class="puesto-rows">
                <label
                  v-for="puesto in consejo.puestos"
                  :key="puesto.id"
                  class="puesto-row"
                  :class="puesto.selected ? 'puesto-row--selected' : ''"
                >
                  <input type="checkbox" v-model="puesto.selected" class="puesto-check" />
                  <div class="puesto-info">
                    <span class="puesto-qty">{{ puesto.cantidad }}</span>
                    <span class="puesto-tipo">{{ puesto.tipo }}</span>
                    <span class="puesto-duracion">por {{ puesto.duracion }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="puestos-summary" v-if="consejosPostulacion.flatMap(c=>c.puestos).some(p=>p.selected)">
            <div class="summary-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Puestos seleccionados ({{ consejosPostulacion.flatMap(c=>c.puestos).filter(p=>p.selected).length }})
            </div>
          </div>
          <div class="puestos-summary" v-else>
            <div class="summary-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A90A0" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Selecciona al menos un puesto para continuar
            </div>
          </div>

          <div class="step-actions">
            <span></span>
            <button class="btn-primary" @click="enviarPostulacion" :disabled="!consejosPostulacion.flatMap(c=>c.puestos).some(p=>p.selected)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Enviar postulación
            </button>
          </div>
        </div>
      </div>
    </template><!-- fin postulacion -->

    <!-- Modal agregar postulante -->
    <Transition name="modal-fade">
      <div v-if="postModal.open" class="modal-backdrop">
        <div class="modal-box">
          <button class="modal-close" @click="postModal.open = false">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <h3 class="modal-title">Registrar postulante</h3>
          <p class="modal-subtitle">{{ postModal.puesto?.consejoName }} · {{ postModal.puesto?.tipo }}</p>
          <div class="modal-form">
            <div class="form-field">
              <label>Asociado <span class="req">*</span></label>
              <div class="autocomplete-wrap">
                <div class="autocomplete-input-wrap">
                  <svg class="ac-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    v-model="postModal.query"
                    type="text"
                    class="autocomplete-input"
                    placeholder="Buscar por nombre o cédula..."
                    @input="onPostSearch"
                    @focus="onPostSearch"
                    @blur="setTimeout(() => postModal.showDrop = false, 150)"
                  />
                  <div v-if="postModal.selected" class="ac-selected-avatar" :style="{ background: postModal.selected.color }">
                    {{ postModal.selected.initials }}
                  </div>
                </div>
                <Transition name="dropdown-fade">
                  <div v-if="postModal.showDrop && postModal.suggestions.length" class="autocomplete-dropdown">
                    <div v-for="a in postModal.suggestions" :key="a.id" class="ac-item" @mousedown.prevent="selectPostulante(a)">
                      <div class="mini-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                      <div class="ac-item-info">
                        <span class="ac-item-name">{{ a.name }}</span>
                        <span class="ac-item-cedula">{{ a.cedula }}</span>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-outline" @click="postModal.open = false">Cancelar</button>
              <button class="btn-primary" :disabled="!postModal.selected" @click="confirmarPostulante">Registrar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { exportExcel, exportPDF } from '../composables/useExport.js'
import { useAuth } from '../composables/useAuth.js'
import { useAsambleas, TIPO_LABEL, MODALIDAD_LABEL } from '../composables/useAsambleas.js'
import { useVotaciones } from '../composables/useVotaciones.js'
import { useAsociados, initialsOf, colorFor } from '../composables/useAsociados.js'
import { useGrabacion } from '../composables/useGrabacion.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import DatePicker from '../components/DatePicker.vue'
import TimePicker from '../components/TimePicker.vue'

const router = useRouter()
const { currentUser, cooperativaId } = useAuth()
const {
  listAsambleas, getAsamblea, findBorradorSinUsar, createDraft,
  saveStep1, savePuestos, saveConvocatoria, enviarConvocatoria,
  addPostulante, removePostulante, setEstadoPostulacion,
  toggleTerna: toggleTernaApi, saveActa,
  finalizarAsamblea: finalizarAsambleaApi,
  misPostulaciones: misPostulacionesApi,
} = useAsambleas()
const { loadElecciones, ensureVotaciones } = useVotaciones()
const { search: searchAsociados, getByProfileId } = useAsociados()
const {
  getGrabacion, subirSegmento, finalizarGrabacion,
  iniciarTranscripcion, generarMinuta, guardarMinutaEditada, subscribeGrabacion,
} = useGrabacion()

/* ── Pasos del wizard ────────────────────── */
const steps = [
  { n: 1, label: 'Datos generales' },
  { n: 2, label: 'Puestos vacantes' },
  { n: 3, label: 'Convocatoria' },
  { n: 4, label: 'Postulaciones' },
  { n: 5, label: 'Aprobación' },
  { n: 6, label: 'Ternas' },
  { n: 7, label: 'Votaciones' },
  { n: 8, label: 'Acta' },
]

/* ── Catálogo de órganos/puestos ─────────── */
const ORGANOS_CATALOGO = [
  { id: 'ca', name: 'Consejo de Administración', color: '#133C65', puestos: [
    { tipo: 'PROPIETARIOS', cantidad: 2, duracion: 'dos años' },
    { tipo: 'SUPLENTE', cantidad: 1, duracion: 'dos años' },
  ] },
  { id: 'cv', name: 'Comité de Vigilancia', color: '#1A9152', puestos: [
    { tipo: 'PROPIETARIOS', cantidad: 2, duracion: 'dos años' },
    { tipo: 'SUPLENTE', cantidad: 1, duracion: 'dos años' },
  ] },
  { id: 'cebs', name: 'Comité de Educación y Bienestar Social', color: '#7B3FA0', puestos: [
    { tipo: 'PROPIETARIOS', cantidad: 2, duracion: 'dos años' },
    { tipo: 'SUPLENTE #2', cantidad: 1, duracion: 'dos años' },
  ] },
]

function buildConsejos() {
  return ORGANOS_CATALOGO.map(c => ({
    id: c.id, name: c.name, color: c.color,
    puestos: c.puestos.map((p, i) => ({
      id: `${c.id}-${i}`, tipo: p.tipo, cantidad: p.cantidad, duracion: p.duracion,
      selected: false, consejoName: c.name, color: c.color,
      dbId: null, postulantes: [],
    })),
  }))
}

function mapPostulacionRow(row) {
  const asociado = row.asociados || {}
  const ESTADO_DB_A_UI = { pendiente: 'inscrito', aprobada: 'aprobado', rechazada: 'rechazado', elegido: 'aprobado' }
  return {
    postulacionId: row.id,
    id: asociado.id,
    asociadoId: asociado.id,
    name: asociado.nombre,
    cedula: asociado.cedula,
    initials: initialsOf(asociado.nombre),
    color: colorFor(asociado.id),
    estado: ESTADO_DB_A_UI[row.estado] ?? 'inscrito',
    votos: null,
    enTerna: row.en_terna,
  }
}

/* ── Estado del wizard ───────────────────── */
const wizardMode = ref(false)
const currentStep = ref(1)
const currentAsambleaId = ref(null)
const wizardLoading = ref(false)
const wizardSaving = ref(false)
const wizardError = ref(null)
const pageError = ref(null)

const wizardData = reactive({
  nombre: '', tipo: '', modalidad: '', fecha: '', hora: '', lugar: '',
  quorumReq: 50, diasConvocatoria: 15, agenda: '',
  fechaConvocatoria: '', fechaLimitePostulacion: '',
  mensajeConvocatoria: '', convocatoriaEnviada: false,
  asistentes: null, horaInicio: '', horaCierre: '', numActa: '', acuerdos: '', observaciones: '',
})

function resetWizardData() {
  Object.assign(wizardData, {
    nombre: '', tipo: '', modalidad: '', fecha: '', hora: '', lugar: '',
    quorumReq: 50, diasConvocatoria: 15, agenda: '',
    fechaConvocatoria: '', fechaLimitePostulacion: '',
    mensajeConvocatoria: '', convocatoriaEnviada: false,
    asistentes: null, horaInicio: '', horaCierre: '', numActa: '', acuerdos: '', observaciones: '',
  })
}

/* ── Consejos / Puestos (paso 2) ─────────── */
const consejos = reactive(buildConsejos())

const puestosSeleccionados = computed(() =>
  consejos.flatMap(c => c.puestos.filter(p => p.selected))
)
const puestosConPostulantes = computed(() => puestosSeleccionados.value)

function applyAsambleaData(row) {
  wizardData.nombre = row.nombre || ''
  wizardData.tipo = TIPO_LABEL[row.tipo] ?? ''
  wizardData.modalidad = MODALIDAD_LABEL[row.modalidad] ?? ''
  wizardData.fecha = row.fecha || ''
  wizardData.hora = row.hora || ''
  wizardData.lugar = row.lugar || ''
  wizardData.quorumReq = row.quorum_requerido ?? 50
  wizardData.diasConvocatoria = row.dias_convocatoria ?? 15
  wizardData.agenda = row.descripcion || ''
  wizardData.fechaConvocatoria = row.fecha_convocatoria || ''
  wizardData.fechaLimitePostulacion = row.fecha_limite_postulacion || ''
  wizardData.mensajeConvocatoria = row.mensaje_convocatoria || ''
  wizardData.convocatoriaEnviada = !!row.convocatoria_enviada_at
  const asistiaronCount = (row.asamblea_invitados || []).filter(i => i.asistio).length
  wizardData.asistentes = asistiaronCount || null
  wizardData.horaInicio = row.hora_inicio_real || ''
  wizardData.horaCierre = row.hora_cierre_real || ''
  wizardData.numActa = row.numero_acta || ''
  wizardData.acuerdos = row.acuerdos || ''
  wizardData.observaciones = row.observaciones || ''

  const fresh = buildConsejos()
  const puestosDb = row.asamblea_puestos || []
  const postulacionesDb = row.asamblea_postulaciones || []
  fresh.forEach(consejo => {
    consejo.puestos.forEach(puesto => {
      const match = puestosDb.find(pd => pd.organo_nombre === consejo.name && pd.tipo === puesto.tipo)
      if (match) {
        puesto.selected = true
        puesto.dbId = match.id
        puesto.cantidad = match.cantidad
        puesto.duracion = match.duracion
        puesto.postulantes = postulacionesDb.filter(p => p.puesto_id === match.id).map(mapPostulacionRow)
      }
    })
  })
  consejos.splice(0, consejos.length, ...fresh)
}

/* ── Resultados de votación (pasos 7 y 8) ── */
const votacionesResultados = ref([])

async function cargarResultadosVotacion(asambleaId) {
  if (!isSupabaseConfigured() || !asambleaId) return
  const { data, error: err } = await loadElecciones(asambleaId)
  if (err || !data) return

  votacionesResultados.value = data
    .filter(e => e.candidates.some(c => c.asociadoId))
    .map(e => {
      const totalVotos = e.candidates.reduce((s, c) => s + (c.votos || 0), 0)
      const maxVotos = Math.max(0, ...e.candidates.map(c => c.votos || 0))
      return {
        titulo: e.title,
        totalVotos,
        candidatos: e.candidates
          .filter(c => c.name !== 'Abstención')
          .map(c => ({ nombre: c.name, votos: c.votos, totalVotos, electo: maxVotos > 0 && c.votos === maxVotos })),
      }
    })

  const votosPorAsociado = new Map()
  data.forEach(e => e.candidates.forEach(c => { if (c.asociadoId) votosPorAsociado.set(c.asociadoId, c.votos) }))
  consejos.forEach(consejo => consejo.puestos.forEach(puesto => {
    puesto.postulantes.forEach(p => {
      if (votosPorAsociado.has(p.asociadoId)) p.votos = votosPorAsociado.get(p.asociadoId)
    })
  }))
}

watch(currentStep, (n) => {
  if ((n === 7 || n === 8) && currentAsambleaId.value) cargarResultadosVotacion(currentAsambleaId.value)
  if (n === 8 && currentAsambleaId.value) cargarGrabacion()
})

/* ── Autoguardado de borrador ─────────────
   El wizard ya persistia cada paso al hacer click en "Siguiente", pero lo
   escrito en el paso ACTUAL se perdia si se salia sin llegar a darle click
   (cierre de pestaña, "Salir", etc.). Estos watchers guardan en segundo plano
   sin avanzar paso_wizard, para poder retomar el borrador exactamente donde
   se dejo. */
const draftSaving = ref(false)
let draftSaveTimer = null
let pendingDraftFn = null

function scheduleDraftSave(fn) {
  if (!isSupabaseConfigured() || !wizardMode.value || !currentAsambleaId.value) return
  pendingDraftFn = fn
  clearTimeout(draftSaveTimer)
  draftSaveTimer = setTimeout(flushDraftSave, 900)
}

// Aplica de inmediato un guardado pendiente (ej. al salir del wizard dentro
// de la ventana de debounce, para no perder lo escrito en los ultimos ~900ms).
async function flushDraftSave() {
  clearTimeout(draftSaveTimer)
  draftSaveTimer = null
  const fn = pendingDraftFn
  pendingDraftFn = null
  if (!fn) return
  draftSaving.value = true
  await fn()
  draftSaving.value = false
}

watch(() => [wizardData.nombre, wizardData.tipo, wizardData.modalidad, wizardData.fecha, wizardData.hora, wizardData.lugar, wizardData.quorumReq, wizardData.diasConvocatoria, wizardData.agenda], () => {
  if (currentStep.value !== 1) return
  if (!wizardData.nombre || !wizardData.tipo || !wizardData.modalidad || !wizardData.fecha || !wizardData.lugar) return
  scheduleDraftSave(() => saveStep1(currentAsambleaId.value, wizardData, { avanzar: false }))
})

watch(puestosSeleccionados, () => {
  if (currentStep.value !== 2) return
  scheduleDraftSave(async () => {
    const { data } = await savePuestos(currentAsambleaId.value, puestosSeleccionados.value, { avanzar: false })
    const creados = data || []
    puestosSeleccionados.value.forEach(p => {
      const match = creados.find(c => c.organo_nombre === p.consejoName && c.tipo === p.tipo)
      if (match) p.dbId = match.id
    })
  })
})

watch(() => [wizardData.fechaConvocatoria, wizardData.fechaLimitePostulacion, wizardData.mensajeConvocatoria], () => {
  if (currentStep.value !== 3) return
  scheduleDraftSave(() => saveConvocatoria(currentAsambleaId.value, wizardData))
})

watch(() => [wizardData.horaInicio, wizardData.horaCierre, wizardData.numActa, wizardData.acuerdos, wizardData.observaciones], () => {
  if (currentStep.value !== 8) return
  scheduleDraftSave(() => saveActa(currentAsambleaId.value, wizardData))
})

/* ── Grabación, transcripción y minuta (paso 8) ──── */
const grabacion = ref(null)
const grabando = ref(false)
const pausado = ref(false)
const segmentosSubidos = ref(0)
const grabacionError = ref(null)
const minutaBorrador = ref('')

let mediaStream = null
let recorder = null
let rotateTimer = null
let seqSegmento = 0
let unsubscribeGrabacion = null
const SEGMENT_MS = 10 * 60 * 1000 // 10 minutos por segmento

async function cargarGrabacion() {
  if (!isSupabaseConfigured() || !currentAsambleaId.value) return
  const { data } = await getGrabacion(currentAsambleaId.value)
  grabacion.value = data
  minutaBorrador.value = data?.minuta_borrador || ''
  segmentosSubidos.value = data?.audio_segments?.length || 0
  seqSegmento = segmentosSubidos.value

  if (unsubscribeGrabacion) unsubscribeGrabacion()
  unsubscribeGrabacion = subscribeGrabacion(currentAsambleaId.value, async () => {
    const { data: fresh } = await getGrabacion(currentAsambleaId.value)
    const estadoAnterior = grabacion.value?.estado
    grabacion.value = fresh
    segmentosSubidos.value = fresh?.audio_segments?.length || 0
    if (fresh?.estado === 'minuta_lista' && estadoAnterior !== 'minuta_lista') {
      minutaBorrador.value = fresh.minuta_borrador || ''
    }
  })
}

function avisarSalidaGrabando(e) {
  if (grabando.value) { e.preventDefault(); e.returnValue = '' }
}

async function iniciarSegmentoGrabacion() {
  recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 })
  const chunks = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' })
    const seqActual = seqSegmento++
    const { error: err } = await subirSegmento(cooperativaId.value, currentAsambleaId.value, seqActual, blob)
    if (err) grabacionError.value = 'Error subiendo segmento de audio: ' + err.message
    else segmentosSubidos.value++
    if (grabando.value && !pausado.value) await iniciarSegmentoGrabacion()
  }
  recorder.start()
  rotateTimer = setTimeout(() => { if (recorder && recorder.state === 'recording') recorder.stop() }, SEGMENT_MS)
}

async function iniciarGrabacion() {
  grabacionError.value = null
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (e) {
    grabacionError.value = 'No se pudo acceder al micrófono: ' + e.message
    return
  }
  grabando.value = true
  pausado.value = false
  window.addEventListener('beforeunload', avisarSalidaGrabando)
  await iniciarSegmentoGrabacion()
}

function pausarGrabacion() {
  if (recorder && recorder.state === 'recording') {
    pausado.value = true
    clearTimeout(rotateTimer)
    recorder.stop()
  }
}

async function reanudarGrabacion() {
  pausado.value = false
  await iniciarSegmentoGrabacion()
}

async function finalizarGrabacionClick() {
  grabando.value = false
  pausado.value = false
  clearTimeout(rotateTimer)
  window.removeEventListener('beforeunload', avisarSalidaGrabando)
  if (recorder && recorder.state === 'recording') recorder.stop()
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null }
  setTimeout(() => finalizarGrabacion(currentAsambleaId.value), 1500)
}

async function iniciarTranscripcionClick() {
  grabacionError.value = null
  const { error: err } = await iniciarTranscripcion(currentAsambleaId.value)
  if (err) grabacionError.value = err.message
  await cargarGrabacion()
}

async function generarMinutaClick() {
  grabacionError.value = null
  const { error: err } = await generarMinuta(currentAsambleaId.value)
  if (err) grabacionError.value = err.message
  await cargarGrabacion()
}

let minutaSaveTimer = null
watch(minutaBorrador, (val) => {
  if (!isSupabaseConfigured() || !currentAsambleaId.value) return
  clearTimeout(minutaSaveTimer)
  minutaSaveTimer = setTimeout(() => guardarMinutaEditada(currentAsambleaId.value, val), 800)
})

onUnmounted(() => {
  if (unsubscribeGrabacion) unsubscribeGrabacion()
  if (mediaStream) mediaStream.getTracks().forEach(t => t.stop())
  window.removeEventListener('beforeunload', avisarSalidaGrabando)
  clearTimeout(draftSaveTimer)
})

/* ── Postulaciones (paso 4 — admin) ──────── */
const postModal = reactive({
  open: false, puesto: null, query: '', selected: null,
  showDrop: false, suggestions: [],
})

const MOCK_ASOCIADOS = [
  { id: 1, name: 'Juan Pérez Mora', initials: 'JP', color: '#133C65', cedula: '1-0234-0567' },
  { id: 2, name: 'Laura Soto Jiménez', initials: 'LS', color: '#1A9152', cedula: '2-0456-0789' },
  { id: 3, name: 'Roberto Ureña', initials: 'RU', color: '#C47F0C', cedula: '3-0123-0456' },
  { id: 4, name: 'Carmen Fallas', initials: 'CF', color: '#7B3FA0', cedula: '1-0678-0901' },
  { id: 5, name: 'Ernesto Vega', initials: 'EV', color: '#00808C', cedula: '4-0234-0567' },
  { id: 6, name: 'María Rodríguez', initials: 'MR', color: '#133C65', cedula: '1-0501-0234' },
  { id: 7, name: 'Carlos Solano', initials: 'CS', color: '#1A9152', cedula: '2-0301-0888' },
  { id: 8, name: 'Ana Vargas', initials: 'AV', color: '#7B3FA0', cedula: '4-0102-0345' },
]

function openPostulacionModal(puesto) {
  postModal.puesto = puesto
  postModal.query = ''
  postModal.selected = null
  postModal.showDrop = false
  postModal.suggestions = []
  postModal.open = true
}

async function onPostSearch() {
  postModal.showDrop = true
  if (!isSupabaseConfigured()) {
    const q = postModal.query.trim().toLowerCase()
    postModal.suggestions = q
      ? MOCK_ASOCIADOS.filter(a => a.name.toLowerCase().includes(q) || a.cedula.includes(q))
      : MOCK_ASOCIADOS.slice(0, 8)
    return
  }
  const { data } = await searchAsociados(postModal.query)
  postModal.suggestions = (data || []).map(a => ({
    id: a.id, name: a.nombre, cedula: a.cedula,
    initials: initialsOf(a.nombre), color: colorFor(a.id),
  }))
}

function selectPostulante(a) {
  postModal.selected = a
  postModal.query = a.name
  postModal.showDrop = false
}

async function confirmarPostulante() {
  if (!postModal.selected || !postModal.puesto) return
  const puesto = postModal.puesto
  const ya = puesto.postulantes.find(p => (p.asociadoId ?? p.id) === postModal.selected.id)
  if (ya) { postModal.open = false; return }

  if (!isSupabaseConfigured() || !puesto.dbId) {
    puesto.postulantes.push({ ...postModal.selected, asociadoId: postModal.selected.id, estado: 'inscrito', votos: null, enTerna: false })
    postModal.open = false
    return
  }
  const { data, error: err } = await addPostulante(puesto.dbId, postModal.selected.id)
  if (err) { wizardError.value = err.message; return }
  puesto.postulantes.push(mapPostulacionRow(data))
  postModal.open = false
}

async function quitarPostulante(puesto, i) {
  const p = puesto.postulantes[i]
  if (isSupabaseConfigured() && p.postulacionId) await removePostulante(p.postulacionId)
  puesto.postulantes.splice(i, 1)
}

/* ── Aprobación (paso 5) ─────────────────── */
async function aprobarPostulante(p) {
  const nuevoUi = p.estado === 'aprobado' ? 'inscrito' : 'aprobado'
  if (isSupabaseConfigured() && p.postulacionId) {
    await setEstadoPostulacion(p.postulacionId, nuevoUi === 'aprobado' ? 'aprobada' : 'pendiente')
  }
  p.estado = nuevoUi
}

async function rechazarPostulante(p) {
  const nuevoUi = p.estado === 'rechazado' ? 'inscrito' : 'rechazado'
  if (isSupabaseConfigured() && p.postulacionId) {
    await setEstadoPostulacion(p.postulacionId, nuevoUi === 'rechazado' ? 'rechazada' : 'pendiente')
  }
  p.estado = nuevoUi
}

/* ── Ternas (paso 6) ─────────────────────── */
async function toggleTerna(candidato) {
  const nuevo = !candidato.enTerna
  if (isSupabaseConfigured() && candidato.postulacionId) {
    await toggleTernaApi(candidato.postulacionId, nuevo)
  }
  candidato.enTerna = nuevo
}

function irAVotaciones() {
  if (!currentAsambleaId.value) return
  router.push({ path: '/dashboard/votaciones', query: { asamblea: currentAsambleaId.value } })
}

function ganadorDe(puesto) {
  const cands = puesto.postulantes.filter(c => c.votos > 0)
  if (!cands.length) return null
  return cands.reduce((a, b) => (Number(a.votos) >= Number(b.votos) ? a : b))
}

/* ── Navegación del wizard ────────────────── */
async function enviarConvocatoriaClick() {
  if (!isSupabaseConfigured() || !currentAsambleaId.value) { wizardData.convocatoriaEnviada = true; return }
  const { error: err } = await enviarConvocatoria(currentAsambleaId.value)
  if (err) { wizardError.value = err.message; return }
  wizardData.convocatoriaEnviada = true
}

async function nextStep() {
  if (currentStep.value >= steps.length) return

  if (!isSupabaseConfigured() || !currentAsambleaId.value) {
    currentStep.value++
    return
  }

  wizardSaving.value = true
  wizardError.value = null
  const id = currentAsambleaId.value
  let result = { error: null }

  if (currentStep.value === 1) {
    result = await saveStep1(id, wizardData)
  } else if (currentStep.value === 2) {
    result = await savePuestos(id, puestosSeleccionados.value)
    if (!result.error) {
      const creados = result.data || []
      puestosSeleccionados.value.forEach(p => {
        const match = creados.find(c => c.organo_nombre === p.consejoName && c.tipo === p.tipo)
        if (match) p.dbId = match.id
      })
    }
  } else if (currentStep.value === 3) {
    result = await saveConvocatoria(id, wizardData)
  } else if (currentStep.value === 6) {
    const { error: err } = await ensureVotaciones(id)
    result = { error: err }
  }

  wizardSaving.value = false
  if (result.error) { wizardError.value = result.error.message || 'No se pudo guardar el paso'; return }
  currentStep.value++
}

async function startWizard(asamblea = null) {
  clearTimeout(draftSaveTimer)
  draftSaveTimer = null
  pendingDraftFn = null
  wizardError.value = null
  pageError.value = null
  votacionesResultados.value = []
  currentAsambleaId.value = null
  grabacion.value = null
  minutaBorrador.value = ''
  resetWizardData()

  if (!isSupabaseConfigured()) {
    currentStep.value = asamblea?.step ?? 1
    wizardMode.value = true
    if (asamblea) { wizardData.nombre = asamblea.name; wizardData.tipo = asamblea.type }
    return
  }

  wizardLoading.value = true
  let data, err
  if (asamblea) {
    ({ data, error: err } = await getAsamblea(asamblea.id))
  } else {
    const { data: existente, error: findErr } = await findBorradorSinUsar(cooperativaId.value)
    if (findErr) { data = null; err = findErr }
    else if (existente) { data = existente; err = null }
    else ({ data, error: err } = await createDraft(cooperativaId.value))
  }
  wizardLoading.value = false

  if (err || !data) { pageError.value = err?.message || 'No se pudo abrir la asamblea'; return }

  currentAsambleaId.value = data.id
  applyAsambleaData(data)
  currentStep.value = data.paso_wizard || 1
  wizardMode.value = true

  // El watch(currentStep) no dispara si el paso destino coincide con el que ya
  // estaba activo (ej. dos asambleas distintas ambas en paso 8): forzamos la
  // carga explicita para no dejar datos de la asamblea anterior en pantalla.
  if (currentStep.value === 7 || currentStep.value === 8) await cargarResultadosVotacion(data.id)
  if (currentStep.value === 8) await cargarGrabacion()
}

async function salirWizard() {
  await flushDraftSave()
  wizardMode.value = false
  await loadAsambleasList()
}

async function finalizarAsamblea() {
  if (!isSupabaseConfigured() || !currentAsambleaId.value) {
    asambleas.value.unshift({
      id: Date.now(),
      name: wizardData.nombre || 'Nueva asamblea',
      type: wizardData.tipo || 'Ordinaria',
      date: wizardData.fecha || '—',
      quorum: wizardData.asistentes ? Math.round(Number(wizardData.asistentes) / 10) : null,
      step: 8,
      status: 'Celebrada',
      statusClass: 'green',
    })
    wizardMode.value = false
    return
  }

  wizardSaving.value = true
  wizardError.value = null
  const { error: e1 } = await saveActa(currentAsambleaId.value, wizardData)
  if (e1) { wizardSaving.value = false; wizardError.value = e1.message; return }
  const { error: e2 } = await finalizarAsambleaApi(currentAsambleaId.value)
  wizardSaving.value = false
  if (e2) { wizardError.value = e2.message; return }

  wizardMode.value = false
  await loadAsambleasList()
}

/* ── Postulación (rol Asociado) ──────────── */
const consejosPostulacion = reactive(buildConsejos())
const juanPostulaciones = ref([
  { id: 1, consejo: 'Consejo de Administración', puesto: 'SUPLENTE', asamblea: 'Asamblea Ordinaria 2026', fechaPost: '25/05/2026', estado: 'Aprobada', estadoClass: 'green', obs: 'Cumple requisitos estatutarios' },
  { id: 2, consejo: 'Comité de Vigilancia', puesto: 'PROPIETARIOS', asamblea: 'Asamblea Ordinaria 2026', fechaPost: '25/05/2026', estado: 'Rechazada', estadoClass: 'red', obs: 'Incompatibilidad de función' },
])
const miAsociado = ref(null)

async function openPostulacion(asamblea) {
  currentPostulacion.value = asamblea
  postulacionMode.value = true
  consejosPostulacion.splice(0, consejosPostulacion.length, ...buildConsejos())

  if (!isSupabaseConfigured()) return

  wizardLoading.value = true
  const [{ data: asocData }, { data: asambleaData }] = await Promise.all([
    getByProfileId(currentUser.value?.id),
    getAsamblea(asamblea.id),
  ])
  wizardLoading.value = false
  miAsociado.value = asocData

  if (asambleaData) {
    const puestosDb = asambleaData.asamblea_puestos || []
    consejosPostulacion.forEach(consejo => consejo.puestos.forEach(puesto => {
      const match = puestosDb.find(pd => pd.organo_nombre === consejo.name && pd.tipo === puesto.tipo)
      if (match) { puesto.dbId = match.id; puesto.cantidad = match.cantidad; puesto.duracion = match.duracion }
    }))
  }

  if (miAsociado.value) {
    const { data: misPost } = await misPostulacionesApi(miAsociado.value.id)
    const ESTADO_DB_A_UI = { pendiente: ['Pendiente', 'yellow'], aprobada: ['Aprobada', 'green'], rechazada: ['Rechazada', 'red'], elegido: ['Aprobada', 'green'] }
    juanPostulaciones.value = (misPost || [])
      .filter(p => p.asamblea_puestos?.asambleas?.id === asamblea.id)
      .map(p => {
        const [estado, estadoClass] = ESTADO_DB_A_UI[p.estado] ?? ['Pendiente', 'yellow']
        return {
          id: p.id,
          consejo: p.asamblea_puestos?.organo_nombre,
          puesto: p.asamblea_puestos?.tipo,
          asamblea: asamblea.name,
          fechaPost: p.created_at ? new Date(p.created_at).toLocaleDateString('es-CR') : '—',
          estado, estadoClass,
          obs: '—',
        }
      })
  }
}

async function enviarPostulacion() {
  const seleccionados = consejosPostulacion.flatMap(c => c.puestos).filter(p => p.selected)

  if (!isSupabaseConfigured()) {
    seleccionados.forEach(p => {
      juanPostulaciones.value.push({
        id: Date.now() + Math.random(),
        consejo: p.consejoName, puesto: p.tipo, asamblea: currentPostulacion.value?.name,
        fechaPost: new Date().toLocaleDateString('es-CR'),
        estado: 'Pendiente', estadoClass: 'yellow', obs: 'En revisión por el comité electoral',
      })
      p.selected = false
    })
    return
  }

  if (!miAsociado.value) { wizardError.value = 'No se encontró tu registro de asociado.'; return }
  for (const p of seleccionados) {
    if (!p.dbId) continue
    const { data, error: err } = await addPostulante(p.dbId, miAsociado.value.id)
    if (!err) {
      juanPostulaciones.value.push({
        id: data.id, consejo: p.consejoName, puesto: p.tipo, asamblea: currentPostulacion.value?.name,
        fechaPost: new Date().toLocaleDateString('es-CR'),
        estado: 'Pendiente', estadoClass: 'yellow', obs: 'En revisión por el comité electoral',
      })
      p.selected = false
    }
  }
}

const postulacionMode = ref(false)
const currentPostulacion = ref(null)

/* ── Datos históricos ────────────────────── */
const DEMO_PROXIMA = {
  id: 99, name: 'Asamblea Ordinaria 2026', type: 'Ordinaria',
  day: '20', month: 'JUN 2026', hora: '9:00 a.m.',
  lugar: 'Sede Central', modalidad: 'Presencial',
  step: 4, status: 'En proceso', statusClass: 'blue',
}
const DEMO_ASAMBLEAS = [
  { id: 1, name: 'Asamblea Ordinaria 2025', type: 'Ordinaria', date: '22/06/2025', quorum: 78, step: 8, status: 'Celebrada', statusClass: 'green' },
  { id: 2, name: 'Asamblea Extraordinaria', type: 'Extraordinaria', date: '14/11/2024', quorum: 65, step: 8, status: 'Celebrada', statusClass: 'green' },
  { id: 3, name: 'Asamblea Ordinaria 2024', type: 'Ordinaria', date: '18/06/2024', quorum: 82, step: 8, status: 'Celebrada', statusClass: 'green' },
]

const asambleas = ref(isSupabaseConfigured() ? [] : DEMO_ASAMBLEAS)

const proxima = computed(() => {
  if (!isSupabaseConfigured()) return DEMO_PROXIMA
  return asambleas.value.find(a => a.statusClass !== 'green' && a.statusClass !== 'red') ?? null
})

async function loadAsambleasList() {
  if (!isSupabaseConfigured()) return
  const { data, error: err } = await listAsambleas()
  if (err) { pageError.value = err.message || 'No se pudo cargar el historial de asambleas'; return }
  if (data) { asambleas.value = data; pageError.value = null }
}

onMounted(loadAsambleasList)
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }

/* ── Encabezado general ─────────────────── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }
.draft-status { color: #1A9152; font-weight: 600; }
.dark .draft-status { color: #4ADE80; }

/* ── Próxima asamblea ───────────────────── */
.next-card {
  background: linear-gradient(135deg, #133C65 0%, #1B5490 100%);
  border-radius: 12px; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px;
}
.next-badge {
  display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.12);
  padding: 4px 12px; border-radius: 20px; align-self: flex-start;
}
.next-body { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.next-date-block {
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.12); border-radius: 10px; padding: 10px 16px; flex-shrink: 0;
}
.next-day { font-size: 32px; font-weight: 800; color: white; line-height: 1; }
.next-month { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.65); letter-spacing: 0.5px; }
.next-info { flex: 1; }
.next-title { font-size: 17px; font-weight: 700; color: white; margin-bottom: 4px; }
.next-meta { font-size: 13px; color: rgba(255,255,255,0.65); }
.next-step-info { display: flex; flex-direction: column; gap: 2px; }
.next-step-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); }
.next-step-val { font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.9); }
.btn-outline-white {
  font-size: 13px; font-weight: 600; color: white;
  background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.3);
  padding: 8px 16px; border-radius: 7px; cursor: pointer; transition: all 0.15s;
  white-space: nowrap; flex-shrink: 0;
}
.btn-outline-white:hover { background: rgba(255,255,255,0.25); }

/* ── Tabla histórico ────────────────────── */
.data-card {
  background: white; border-radius: 12px;
  border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }
.card-head { padding: 14px 18px; border-bottom: 1px solid #F0F4F8; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dark .card-head { border-color: #3D5069; }
.header-actions { display: flex; align-items: center; gap: 6px; }
.export-btn { width: 34px; height: 34px; background: none; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.export-btn--excel { color: #217346; border: 1.5px solid #C8E6C9; }
.export-btn--excel:hover { background: rgba(33,115,70,0.08); border-color: #217346; }
.export-btn--pdf { color: #C0392B; border: 1.5px solid #FFCDD2; }
.export-btn--pdf:hover { background: rgba(192,57,43,0.08); border-color: #C0392B; }
.card-title { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .card-title { color: #E2E8F0; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 12px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 12px 16px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #3D5069; }
.data-table tbody tr:hover { background: #F8FAFC; }
.dark .data-table tbody tr:hover { background: rgba(255,255,255,0.04); }
.data-table tbody tr:last-child td { border-bottom: none; }
.cell-bold { font-weight: 600; }
.cell-actions { white-space: nowrap; }

.mini-steps { display: flex; gap: 3px; }
.mini-dot { width: 8px; height: 8px; border-radius: 50%; background: #E8EEF4; }
.mini-dot--done { background: #133C65; }
.dark .mini-dot { background: #3D5069; }
.dark .mini-dot--done { background: #93B8D8; }

/* ── Wizard topbar ──────────────────────── */
.wizard-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }

.btn-outline-danger {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #C0392B;
  background: none; border: 1.5px solid #F5C6C0; padding: 8px 14px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline-danger:hover { background: rgba(192,57,43,0.06); border-color: #C0392B; }

/* ── Stepper ────────────────────────────── */
.stepper-wrap {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 18px 20px; overflow-x: auto;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .stepper-wrap { background: #1D293D; border-color: #3D5069; }

.stepper {
  display: flex; align-items: flex-start; min-width: max-content; gap: 0;
}

.step-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  position: relative; flex: 1; min-width: 80px;
}

.step-connector {
  position: absolute; top: 14px; right: calc(50% + 14px); left: calc(-50% + 14px);
  height: 2px; background: #E8EEF4; z-index: 0;
}
.dark .step-connector { background: #3D5069; }
.step-connector--done { background: #133C65; }
.dark .step-connector--done { background: #93B8D8; }

.step-circle {
  width: 28px; height: 28px; border-radius: 50%; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}
.step-circle--done    { background: #133C65; color: white; cursor: pointer; }
.step-circle--active  { background: #133C65; color: white; box-shadow: 0 0 0 4px rgba(19,60,101,0.15); }
.step-circle--future  { background: #F0F4F8; color: #7A90A0; border: 2px solid #E8EEF4; }
.step-circle--clickable:hover { background: #0D2A47; }

.dark .step-circle--done   { background: #93B8D8; color: #162033; }
.dark .step-circle--active { background: #93B8D8; color: #162033; box-shadow: 0 0 0 4px rgba(147,184,216,0.2); }
.dark .step-circle--future { background: #2D3F55; color: #64748B; border-color: #3D5069; }

.step-label {
  font-size: 10.5px; font-weight: 500; color: #7A90A0; text-align: center;
  line-height: 1.3; max-width: 72px;
}
.step-label--active { font-weight: 700; color: #133C65; }
.dark .step-label--active { color: #93B8D8; }

/* ── Wizard card ────────────────────────── */
.wizard-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .wizard-card { background: #1D293D; border-color: #3D5069; }

.wcard-header {
  display: flex; align-items: center; gap: 14px; padding: 18px 22px;
  background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .wcard-header { background: #162033; border-color: #3D5069; }

.wcard-icon {
  width: 42px; height: 42px; border-radius: 11px; background: #133C65; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.wcard-title { font-size: 16px; font-weight: 700; color: #133C65; margin-bottom: 2px; }
.dark .wcard-title { color: #E2E8F0; }
.wcard-desc { font-size: 13px; color: #7A90A0; }

.wcard-body { padding: 22px; display: flex; flex-direction: column; gap: 16px; }

/* ── Form ───────────────────────────────── */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 12.5px; font-weight: 600; color: #4A6070; }
.dark .form-field label { color: #94A3B8; }
.form-field input, .form-field select, .form-field textarea {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.form-field textarea { height: auto; padding: 10px 12px; resize: vertical; }
.dark .form-field input, .dark .form-field select, .dark .form-field textarea {
  background: #162033; border-color: #3D5069; color: #E2E8F0;
}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #133C65; }
.field-readonly { background: #F8FAFC !important; color: #7A90A0 !important; cursor: default; }
.dark .field-readonly { background: #2D3F55 !important; }
.req { color: #C0392B; }

/* ── Puestos grid ───────────────────────── */
.puestos-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  border: 1px solid #D4E4F4; border-radius: 10px; overflow: hidden;
}
.dark .puestos-grid { border-color: #3D5069; }

.consejo-cell {
  padding: 18px 20px; background: white;
  border-right: 1px solid #D4E4F4; border-bottom: 1px solid #D4E4F4;
}
.consejo-cell:nth-child(2n) { border-right: none; }
.consejo-cell:nth-last-child(-n+2) { border-bottom: none; }
.dark .consejo-cell { background: #1D293D; border-color: #3D5069; }

.consejo-title { font-size: 13px; font-weight: 700; color: #133C65; margin-bottom: 14px; }
.dark .consejo-title { color: #93B8D8; }

.puesto-rows { display: flex; flex-direction: column; gap: 10px; }

.puesto-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border: 1.5px solid #E8EEF4; border-radius: 8px;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.puesto-row:hover { border-color: #133C65; background: #F0F7FF; }
.puesto-row--selected { border-color: #133C65; background: #EBF3FF; }
.dark .puesto-row { border-color: #3D5069; }
.dark .puesto-row--selected { background: rgba(19,60,101,0.2); border-color: #93B8D8; }

.puesto-check { width: 16px; height: 16px; accent-color: #133C65; flex-shrink: 0; cursor: pointer; }
.puesto-info { display: flex; align-items: baseline; gap: 5px; }
.puesto-qty { font-size: 16px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; }
.dark .puesto-qty { color: #93B8D8; }
.puesto-tipo { font-size: 13px; font-weight: 700; color: #1A2B3C; text-transform: uppercase; letter-spacing: 0.3px; }
.dark .puesto-tipo { color: #E2E8F0; }
.puesto-duracion { font-size: 12px; color: #7A90A0; }

.puestos-summary {
  background: rgba(26,145,82,0.06); border: 1px solid rgba(26,145,82,0.2);
  border-radius: 9px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
}
.summary-label { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: #1A6B42; }
.summary-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.summary-chip {
  font-size: 12px; font-weight: 600; background: white; border: 1px solid rgba(26,145,82,0.25);
  color: #1A6B42; padding: 3px 10px; border-radius: 20px;
}

.puestos-empty {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #B0C0D0; padding: 12px 4px;
}

/* ── Convocatoria ───────────────────────── */
.convoc-puestos { background: #F8FAFC; border: 1px solid #E8EEF4; border-radius: 9px; padding: 14px; }
.dark .convoc-puestos { background: #162033; border-color: #3D5069; }
.convoc-puestos-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #7A90A0; margin-bottom: 10px; }
.convoc-puesto-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #F0F4F8; }
.dark .convoc-puesto-row { border-color: #3D5069; }
.convoc-puesto-row:last-child { border-bottom: none; }
.convoc-org-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.convoc-info { display: flex; flex-direction: column; gap: 1px; }
.convoc-organo { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .convoc-organo { color: #E2E8F0; }
.convoc-tipo { font-size: 11.5px; color: #7A90A0; }

.convoc-estado {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 9px; font-size: 13.5px; font-weight: 600;
}
.convoc-pending { background: #FFF8E7; border: 1px solid #F5E0A0; color: #8A5800; }
.convoc-ok { background: rgba(26,145,82,0.08); border: 1px solid rgba(26,145,82,0.25); color: #1A6B42; }

/* ── Postulaciones ──────────────────────── */
.postulaciones-list { display: flex; flex-direction: column; gap: 18px; }
.postulacion-group { border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden; }
.dark .postulacion-group { border-color: #3D5069; }
.postulacion-group-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .postulacion-group-header { background: #162033; border-color: #3D5069; }
.postulacion-organo { font-size: 13.5px; font-weight: 700; color: #133C65; margin-right: 8px; }
.dark .postulacion-organo { color: #93B8D8; }
.postulacion-tipo-badge { font-size: 11px; font-weight: 700; background: rgba(19,60,101,0.1); color: #133C65; padding: 2px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.3px; }
.dark .postulacion-tipo-badge { background: rgba(147,184,216,0.15); color: #93B8D8; }

.postulantes-table { padding: 0; }
.postulante-row {
  display: grid; grid-template-columns: 1.5fr 1fr 100px 32px;
  padding: 10px 16px; border-bottom: 1px solid #F0F4F8; align-items: center; gap: 10px;
}
.dark .postulante-row { border-color: #3D5069; }
.postulante-row:last-child { border-bottom: none; }
.postulante-row--head {
  background: #F8FAFC; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px; color: #7A90A0;
}
.dark .postulante-row--head { background: #162033; }

.cell-user { display: flex; align-items: center; gap: 8px; }
.cell-cedula { font-size: 12px; font-family: monospace; color: #7A90A0; }
.mini-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.postulantes-empty { padding: 16px; font-size: 13px; color: #B0C0D0; }

.btn-add-slim {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 5px 12px;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.btn-add-slim:hover { background: #EBF3FF; border-color: #133C65; }

.action-btn-sm {
  width: 26px; height: 26px; background: none; border: none; cursor: pointer;
  border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #B0C0D0;
  transition: color 0.12s, background 0.12s;
}
.action-btn-sm--red:hover { color: #C0392B; background: rgba(192,57,43,0.08); }

/* ── Aprobación ─────────────────────────── */
.aprobacion-group { border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
.dark .aprobacion-group { border-color: #3D5069; }
.aprobacion-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .aprobacion-header { background: #162033; border-color: #3D5069; }
.aprobacion-rows { display: flex; flex-direction: column; }
.aprobacion-row {
  display: grid; grid-template-columns: 1.4fr 1fr auto auto;
  padding: 10px 16px; border-bottom: 1px solid #F0F4F8; align-items: center; gap: 12px;
}
.dark .aprobacion-row { border-color: #3D5069; }
.aprobacion-row:last-child { border-bottom: none; }
.aprobacion-actions { display: flex; gap: 6px; }

.apr-btn {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600;
  background: none; padding: 5px 12px; border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.apr-btn--aprobar { border: 1.5px solid #C8E6C9; color: #2E7D32; }
.apr-btn--aprobar:hover { background: rgba(26,145,82,0.08); }
.apr-btn--active-green { background: rgba(26,145,82,0.12) !important; border-color: #1A9152 !important; color: #1A6B42 !important; }
.apr-btn--rechazar { border: 1.5px solid #FFCDD2; color: #C62828; }
.apr-btn--rechazar:hover { background: rgba(192,57,43,0.08); }
.apr-btn--active-red { background: rgba(192,57,43,0.12) !important; border-color: #C0392B !important; color: #9B2335 !important; }

/* ── Ternas ─────────────────────────────── */
.terna-group { border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
.dark .terna-group { border-color: #3D5069; }
.terna-aprobados { padding: 14px 16px; }
.terna-aprobados-label { font-size: 12px; color: #7A90A0; margin-bottom: 12px; }
.terna-candidatos { display: flex; flex-wrap: wrap; gap: 8px; }
.terna-candidato {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border: 1.5px solid #E8EEF4; border-radius: 8px;
  cursor: pointer; transition: all 0.15s; position: relative;
}
.dark .terna-candidato { border-color: #3D5069; }
.terna-candidato:hover { border-color: #133C65; background: #F0F7FF; }
.terna-candidato--selected { border-color: #133C65; background: #EBF3FF; }
.dark .terna-candidato--selected { background: rgba(19,60,101,0.2); }
.terna-cand-name { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .terna-cand-name { color: #E2E8F0; }
.terna-pos { font-size: 11px; font-weight: 800; color: #133C65; background: #D4E4F4; padding: 1px 6px; border-radius: 10px; }
.terna-check { flex-shrink: 0; }

/* ── Votaciones ─────────────────────────── */
.votacion-group { border: 1px solid #E8EEF4; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
.dark .votacion-group { border-color: #3D5069; }
.votacion-candidatos { display: flex; flex-direction: column; }
.votacion-row {
  display: grid; grid-template-columns: 1.5fr auto auto;
  padding: 10px 16px; border-bottom: 1px solid #F0F4F8; align-items: center; gap: 16px;
}
.dark .votacion-row { border-color: #3D5069; }
.votacion-row:last-child { border-bottom: none; }
.votacion-row--extra .cell-user { display: none; }
.votacion-row--extra { grid-template-columns: 1.5fr auto; }
.votos-extra-label { font-size: 13px; color: #7A90A0; font-style: italic; }
.votos-input-wrap { display: flex; align-items: center; gap: 6px; }
.votos-input {
  width: 72px; height: 36px; padding: 0 10px; text-align: center;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 15px; font-weight: 700; font-family: inherit; font-variant-numeric: tabular-nums;
  background: white; color: #133C65; outline: none;
}
.dark .votos-input { background: #162033; border-color: #3D5069; color: #93B8D8; }
.votos-input:focus { border-color: #133C65; }
.votos-label { font-size: 12px; color: #7A90A0; }
.ganador-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700; color: #1A6B42;
  background: rgba(26,145,82,0.12); padding: 4px 12px; border-radius: 20px;
}

/* ── Acta ───────────────────────────────── */
.acta-section { background: #F8FAFC; border: 1px solid #E8EEF4; border-radius: 10px; padding: 16px; }
.dark .acta-section { background: #162033; border-color: #3D5069; }
.acta-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #7A90A0; margin-bottom: 12px; }
.acta-resultado { padding: 10px 0; border-bottom: 1px solid #F0F4F8; }
.dark .acta-resultado { border-color: #3D5069; }
.acta-resultado:last-child { border-bottom: none; }
.acta-organo { font-size: 12.5px; font-weight: 700; color: #133C65; display: block; margin-bottom: 6px; }
.dark .acta-organo { color: #93B8D8; }
.acta-electo { display: flex; align-items: center; gap: 10px; }
.acta-electo--pending { color: #B0C0D0; font-size: 13px; }
.acta-votos { font-size: 12px; color: #7A90A0; margin-left: 4px; }

.file-drop {
  border: 2px dashed #D4E4F4; border-radius: 10px; padding: 22px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  text-align: center; background: #F8FAFC; cursor: pointer; transition: border-color 0.15s;
}
.dark .file-drop { background: #162033; border-color: #3D5069; }
.file-drop:hover { border-color: #133C65; }
.file-drop p { font-size: 13.5px; color: #4A6070; margin: 0; }
.dark .file-drop p { color: #94A3B8; }
.file-drop small { font-size: 11.5px; color: #B0C0D0; }
.file-link { color: #133C65; font-weight: 600; cursor: pointer; text-decoration: underline; }
.dark .file-link { color: #93B8D8; }

/* ── Wizard nav ─────────────────────────── */
.wizard-nav {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 14px 22px;
}
.dark .wizard-nav { background: #1D293D; border-color: #3D5069; }
.wizard-nav-right { display: flex; align-items: center; gap: 14px; }
.wizard-nav-hint { font-size: 12.5px; color: #7A90A0; }

/* ── Badges ─────────────────────────────── */
.badge { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--blue   { background: rgba(19,60,101,0.1); color: #133C65; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--red    { background: rgba(192,57,43,0.12); color: #9B2335; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.dark .badge--green  { background: rgba(74,222,128,0.15);  color: #4ADE80; }
.dark .badge--blue   { background: rgba(96,165,250,0.18);  color: #60A5FA; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBBF24; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }

/* ── Buttons ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }
.btn-primary:disabled { background: #7A90A0; cursor: not-allowed; }
.btn-sm { padding: 7px 13px; font-size: 12.5px; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }

.btn-success {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #1A9152;
  border: none; padding: 9px 20px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s;
}
.btn-success:hover { background: #157A44; }

.action-btn {
  background: none; border: none; color: #7A90A0; cursor: pointer;
  padding: 5px; border-radius: 6px; display: inline-flex; align-items: center;
  vertical-align: middle; transition: color 0.12s, background 0.12s;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }

/* ── Modal postulante ───────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.5);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px; padding: 28px;
  width: 100%; max-width: 480px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22);
}
.dark .modal-box { background: #1D293D; }
.modal-close {
  position: absolute; top: 14px; right: 14px;
  width: 28px; height: 28px; border-radius: 7px; background: #F4F6F8;
  border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }
.modal-title { font-size: 18px; font-weight: 700; color: #133C65; margin-bottom: 3px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 13px; color: #7A90A0; margin-bottom: 18px; }
.modal-form { display: flex; flex-direction: column; gap: 14px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

/* ── Autocomplete ───────────────────────── */
.autocomplete-wrap { position: relative; }
.autocomplete-input-wrap { position: relative; display: flex; align-items: center; }
.ac-search-icon { position: absolute; left: 11px; color: #7A90A0; pointer-events: none; z-index: 1; }
.autocomplete-input {
  width: 100%; height: 40px; padding: 0 40px 0 32px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .autocomplete-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.autocomplete-input:focus { border-color: #133C65; }
.ac-selected-avatar {
  position: absolute; right: 10px;
  width: 24px; height: 24px; border-radius: 50%;
  color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.autocomplete-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: white; border: 1.5px solid #D4E4F4; border-radius: 10px;
  box-shadow: 0 8px 30px rgba(19,60,101,0.14); z-index: 100; max-height: 200px; overflow-y: auto;
}
.dark .autocomplete-dropdown { background: #1D293D; border-color: #3D5069; }
.ac-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  cursor: pointer; border-bottom: 1px solid #F0F4F8; transition: background 0.1s;
}
.dark .ac-item { border-color: #3D5069; }
.ac-item:last-child { border-bottom: none; }
.ac-item:hover { background: #F0F7FF; }
.dark .ac-item:hover { background: rgba(19,60,101,0.2); }
.ac-item-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.ac-item-name { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .ac-item-name { color: #E2E8F0; }
.ac-item-cedula { font-size: 11px; color: #7A90A0; font-family: monospace; }

/* ── Transitions ────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ─────────────────────────── */
@media (max-width: 900px) {
  .puestos-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .step-label { display: none; }
  .step-item { min-width: 40px; }
}

/* ── Vista Asociado: postulaciones ─────── */
.post-form-hint { font-size: 12.5px; color: #7A90A0; margin-top: 3px; }
.post-form-actions { padding: 0 20px 20px; }
.puesto-chip {
  font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
  background: rgba(19,60,101,0.08); color: #133C65;
  padding: 3px 9px; border-radius: 12px;
}
.dark .puesto-chip { background: rgba(147,184,216,0.15); color: #93B8D8; }
.text-muted-sm { font-size: 12px; color: #7A90A0; }

/* ── Votaciones resultado ───────────────── */
.votaciones-notice {
  display: flex; align-items: flex-start; gap: 10px;
  background: #EBF3FF; border: 1px solid #C5D8F0; border-radius: 8px;
  padding: 12px 14px; font-size: 13px; color: #133C65; margin-bottom: 18px;
}
.dark .votaciones-notice { background: rgba(147,184,216,0.1); border-color: #3D5069; color: #93B8D8; }
.votacion-resultado-group { margin-bottom: 20px; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary, .page-header .btn-outline { width: 100%; justify-content: center; }
  .data-card { overflow-x: auto; }
  .form-row { grid-template-columns: 1fr; }
  .stepper { overflow-x: auto; padding-bottom: 6px; }
  .stepper::-webkit-scrollbar { height: 0; }
  .step-label { font-size: 10px; white-space: nowrap; }
  .wizard-body { padding: 16px; }
  .mini-steps { flex-wrap: wrap; gap: 2px; }
}
</style>
