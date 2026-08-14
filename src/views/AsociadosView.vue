<template>
  <div class="module-page">

    <!-- ═══════════════════════════════════════
         VISTA PRINCIPAL (lista)
    ═══════════════════════════════════════ -->
    <template v-if="!selectedAsociado">

      <div class="page-header">
        <div>
          <h2 class="page-title">Asociados</h2>
          <p class="page-subtitle">Registro y seguimiento de socios de la cooperativa</p>
        </div>
        <button class="btn-primary" @click="openForm('nuevo')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar asociado
        </button>
      </div>

      <p v-if="loadError" style="color:#C0392B; font-size:13.5px;">{{ loadError }}</p>

      <div class="summary-row">
        <div class="summary-card">
          <span class="summary-num">{{ summary.activos }}</span>
          <span class="summary-lbl">Total activos</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.nuevosMes }}</span>
          <span class="summary-lbl">Nuevos este mes</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.pendientes }}</span>
          <span class="summary-lbl">Pendientes de aprobación</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ summary.enMora }}</span>
          <span class="summary-lbl">En mora</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">₡ {{ fmt(summary.capitalTotal) }}</span>
          <span class="summary-lbl">Capital social total</span>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="search" placeholder="Buscar por nombre, cédula, N° asociado..." class="search-input" />
        </div>
        <select v-model="filterEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
          <option>Pendiente</option>
          <option>Suspendido</option>
        </select>
        <select v-model="filterCategoria" class="filter-select">
          <option value="">Todas las categorías</option>
          <option>Activo</option>
          <option>Honorario</option>
          <option>Colaborador</option>
        </select>
        <select v-model="filterAportes" class="filter-select">
          <option value="">Estado de aportes</option>
          <option>Al día</option>
          <option>En mora</option>
        </select>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel"
            @click="exportCSV(filteredAsociados,[{key:'name',label:'Nombre'},{key:'cedula',label:'Cédula'},{key:'numAsociado',label:'N° Asociado'},{key:'categoria',label:'Categoría'},{key:'capitalSocial',label:'Capital social'},{key:'aporteMensual',label:'Aporte mensual'},{key:'fechaIngreso',label:'Fecha ingreso'},{key:'statusLabel',label:'Estado'}],'asociados')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Listado de Asociados')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Asociado</th>
              <th>Cédula</th>
              <th>Categoría</th>
              <th class="th-right">Capital social</th>
              <th class="th-right">Aporte mensual</th>
              <th>Aportes</th>
              <th>Ingreso</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filteredAsociados" :key="a.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                  <div>
                    <div class="cell-name">{{ a.name }}</div>
                    <div class="cell-num">{{ a.numAsociado }}</div>
                  </div>
                </div>
              </td>
              <td class="cell-mono">{{ a.cedula }}</td>
              <td>
                <span class="badge badge--cat">{{ a.categoria }}</span>
              </td>
              <td class="cell-num-right">₡ {{ fmt(a.capitalSocial) }}</td>
              <td class="cell-num-right">₡ {{ fmt(a.aporteMensual) }}</td>
              <td>
                <span class="badge" :class="a.aporteBadge === 'green' ? 'badge--green' : 'badge--red'">
                  {{ a.aporteBadge === 'green' ? 'Al día' : 'En mora' }}
                </span>
              </td>
              <td>{{ a.fechaIngreso }}</td>
              <td>
                <span class="badge" :class="`badge--${a.status}`">{{ a.statusLabel }}</span>
              </td>
              <td>
                <button class="action-btn" title="Ver expediente" @click="selectedAsociado = a">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="!filteredAsociados.length">
              <td colspan="9" class="empty-row">No se encontraron asociados</td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>

    <!-- ═══════════════════════════════════════
         DETALLE DEL ASOCIADO
    ═══════════════════════════════════════ -->
    <template v-else-if="selectedAsociado">

      <!-- Encabezado de detalle -->
      <div class="detail-header">
        <button class="back-btn" @click="selectedAsociado = null; activeTab = 'expediente'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a la lista
        </button>
        <div class="detail-title-row">
          <div class="detail-avatar" :style="{ background: selectedAsociado.color }">{{ selectedAsociado.initials }}</div>
          <div>
            <h2 class="detail-name">{{ selectedAsociado.name }}</h2>
            <div class="detail-meta">
              {{ selectedAsociado.numAsociado }}
              <span class="meta-dot">·</span>
              {{ selectedAsociado.cedula }}
              <span class="meta-dot">·</span>
              <span class="badge" :class="`badge--${selectedAsociado.status}`">{{ selectedAsociado.statusLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas -->
      <div class="tabs-nav-wrap">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs" :key="tab.id"
            class="tab-btn"
            :class="activeTab === tab.id ? 'tab-btn--active' : ''"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- ─── PESTAÑA: Expediente ─── -->
      <div v-if="activeTab === 'expediente'" class="tab-panel">
        <div class="expediente-layout">

          <!-- Sidebar -->
          <div class="exp-sidebar">
            <div class="exp-sidebar-avatar" :style="{ background: selectedAsociado.color }">
              {{ selectedAsociado.initials }}
            </div>
            <div class="exp-sidebar-name">{{ selectedAsociado.name }}</div>
            <div class="exp-sidebar-num">{{ selectedAsociado.numAsociado }}</div>
            <span class="badge" :class="`badge--${selectedAsociado.status}`" style="margin-top:2px;">{{ selectedAsociado.statusLabel }}</span>
            <div class="exp-sidebar-divider"></div>
            <div class="exp-quick-fact">
              <span class="eq-label">Categoría</span>
              <span class="eq-val">{{ selectedAsociado.categoria }}</span>
            </div>
            <div class="exp-quick-fact">
              <span class="eq-label">Ingreso</span>
              <span class="eq-val">{{ selectedAsociado.fechaIngreso }}</span>
            </div>
            <div class="exp-quick-fact">
              <span class="eq-label">Capital social</span>
              <span class="eq-val">₡ {{ fmt(selectedAsociado.capitalSocial) }}</span>
            </div>
            <div class="exp-quick-fact">
              <span class="eq-label">Aporte mensual</span>
              <span class="eq-val">₡ {{ fmt(selectedAsociado.aporteMensual) }}</span>
            </div>
            <div class="exp-quick-fact">
              <span class="eq-label">Aportes</span>
              <span class="badge" :class="selectedAsociado.aporteBadge === 'green' ? 'badge--green' : 'badge--red'">
                {{ selectedAsociado.aporteBadge === 'green' ? 'Al día' : 'En mora' }}
              </span>
            </div>
            <div class="exp-sidebar-divider"></div>
            <button class="btn-outline-full" @click="openForm('editar')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar datos
            </button>
          </div>

          <!-- Panel principal -->
          <div class="exp-main">

            <div class="exp-section">
              <div class="exp-section-title">Datos personales</div>
              <div class="exp-grid">
                <div class="exp-field"><span class="ef-label">Nombre completo</span><span class="ef-val">{{ selectedAsociado.name }}</span></div>
                <div class="exp-field"><span class="ef-label">Cédula de identidad</span><span class="ef-val">{{ selectedAsociado.cedula }}</span></div>
                <div class="exp-field"><span class="ef-label">Fecha de nacimiento</span><span class="ef-val">{{ selectedAsociado.fechaNac }}</span></div>
                <div class="exp-field"><span class="ef-label">Género</span><span class="ef-val">{{ selectedAsociado.genero }}</span></div>
                <div class="exp-field"><span class="ef-label">Estado civil</span><span class="ef-val">{{ selectedAsociado.estadoCivil }}</span></div>
                <div class="exp-field"><span class="ef-label">Nacionalidad</span><span class="ef-val">{{ selectedAsociado.nacionalidad }}</span></div>
              </div>
            </div>

            <div class="exp-section">
              <div class="exp-section-title">Contactos</div>
              <div class="exp-grid">
                <div class="exp-field"><span class="ef-label">Teléfono principal</span><span class="ef-val">{{ selectedAsociado.telPrincipal }}</span></div>
                <div class="exp-field"><span class="ef-label">Teléfono secundario</span><span class="ef-val">{{ selectedAsociado.telSecundario || '—' }}</span></div>
                <div class="exp-field"><span class="ef-label">Correo electrónico</span><span class="ef-val">{{ selectedAsociado.email }}</span></div>
                <div class="exp-field exp-field--full"><span class="ef-label">Dirección</span><span class="ef-val">{{ selectedAsociado.direccion }}</span></div>
              </div>
            </div>

            <div class="exp-section">
              <div class="exp-section-title">Afiliación</div>
              <div class="exp-grid">
                <div class="exp-field"><span class="ef-label">N° de asociado</span><span class="ef-val ef-val--mono">{{ selectedAsociado.numAsociado }}</span></div>
                <div class="exp-field"><span class="ef-label">Categoría</span><span class="ef-val">{{ selectedAsociado.categoria }}</span></div>
                <div class="exp-field"><span class="ef-label">Fecha de ingreso</span><span class="ef-val">{{ selectedAsociado.fechaIngreso }}</span></div>
                <div class="exp-field"><span class="ef-label">Estado</span>
                  <span class="badge" :class="`badge--${selectedAsociado.status}`">{{ selectedAsociado.statusLabel }}</span>
                </div>
              </div>
            </div>

            <div class="exp-section">
              <div class="exp-section-head">
                <div class="exp-section-title" style="margin-bottom:0">Beneficiarios</div>
                <button class="btn-add-slim" @click="openForm('editar')">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar
                </button>
              </div>
              <table class="inner-table">
                <thead><tr><th>Nombre</th><th>Relación</th><th>Porcentaje</th></tr></thead>
                <tbody>
                  <tr v-for="b in selectedAsociado.beneficiarios" :key="b.nombre">
                    <td>{{ b.nombre }}</td>
                    <td>{{ b.relacion }}</td>
                    <td>
                      <div class="pct-bar-wrap">
                        <div class="pct-bar" :style="{ width: b.porcentaje + '%' }"></div>
                        <span class="pct-val">{{ b.porcentaje }}%</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!selectedAsociado.beneficiarios.length">
                    <td colspan="3" class="empty-row">Sin beneficiarios registrados</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div><!-- /exp-main -->
        </div><!-- /expediente-layout -->
      </div>

      <!-- ─── PESTAÑA: Solicitudes ─── -->
      <div v-if="activeTab === 'solicitudes'" class="tab-panel">
        <div class="tab-card">
          <div class="tab-card-head">
            <h3 class="tab-card-title">Solicitudes</h3>
          </div>
          <table class="data-table">
            <thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Responsable</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr v-for="s in selectedAsociado.solicitudes" :key="s.fecha + s.tipo">
                <td><span class="badge badge--blue">{{ s.tipo }}</span></td>
                <td>{{ s.desc }}</td>
                <td>{{ s.fecha }}</td>
                <td>{{ s.responsable }}</td>
                <td><span class="badge" :class="`badge--${s.estadoClass}`">{{ s.estado }}</span></td>
                <td><button class="action-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
              </tr>
              <tr v-if="!selectedAsociado.solicitudes.length"><td colspan="6" class="empty-row">Sin solicitudes registradas</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── PESTAÑA: Aportes ─── -->
      <div v-if="activeTab === 'aportes'" class="tab-panel">
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--navy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div><div class="kpi-val">₡ {{ fmt(selectedAsociado.capitalSocial) }}</div><div class="kpi-lbl">Capital social total</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div><div class="kpi-val">₡ {{ fmt(selectedAsociado.aporteMensual) }}</div><div class="kpi-lbl">Aporte mensual</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div><div class="kpi-val">{{ selectedAsociado.aportes.length }}</div><div class="kpi-lbl">Aportes registrados</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon" :class="selectedAsociado.aporteBadge === 'green' ? 'kpi-icon--green' : 'kpi-icon--red'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="kpi-val">{{ selectedAsociado.aporteBadge === 'green' ? 'Al día' : 'En mora' }}</div>
              <div class="kpi-lbl">Estado de aportes</div>
            </div>
          </div>
        </div>

        <div class="tab-card">
          <div class="tab-card-head">
            <h3 class="tab-card-title">Historial de aportes</h3>
            <button class="btn-outline btn-sm">Exportar</button>
          </div>
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Monto</th><th>Estado</th></tr></thead>
            <tbody>
              <tr v-for="a in selectedAsociado.aportes" :key="a.fecha + a.tipo">
                <td>{{ a.fecha }}</td>
                <td><span class="badge badge--blue">{{ a.tipo }}</span></td>
                <td>{{ a.desc || 'Aporte ' + a.tipo.toLowerCase() }}</td>
                <td class="cell-num-right">₡ {{ fmt(a.monto) }}</td>
                <td><span class="badge" :class="`badge--${a.estadoClass}`">{{ a.estado }}</span></td>
              </tr>
              <tr v-if="!selectedAsociado.aportes.length"><td colspan="5" class="empty-row">Sin registros</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── PESTAÑA: Beneficios ─── -->
      <div v-if="activeTab === 'beneficios'" class="tab-panel">
        <div v-for="grupo in beneficiosGrupos" :key="grupo.key" class="tab-card">
          <div class="tab-card-head">
            <h3 class="tab-card-title">{{ grupo.label }}</h3>
          </div>
          <table class="data-table">
            <thead><tr><th>Tipo</th><th>Beneficiario</th><th>Monto</th><th>Período</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr v-for="b in selectedAsociado.beneficiosHist.filter(x => x.tipo === grupo.key)" :key="b.tipo + b.beneficiario">
                <td><span class="badge badge--purple">{{ b.tipo }}</span></td>
                <td>{{ b.beneficiario }}</td>
                <td class="cell-num-right">₡ {{ fmt(b.monto) }}</td>
                <td>{{ b.periodo }}</td>
                <td><span class="badge" :class="`badge--${b.estadoClass}`">{{ b.estado }}</span></td>
                <td><button class="action-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
              </tr>
              <tr v-if="!selectedAsociado.beneficiosHist.filter(x => x.tipo === grupo.key).length">
                <td colspan="6" class="empty-row">Sin registros de {{ grupo.label.toLowerCase() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── PESTAÑA: Documentos ─── -->
      <div v-if="activeTab === 'documentos'" class="tab-panel">
        <div v-for="cat in docCategorias" :key="cat.key" class="tab-card">
          <div class="tab-card-head">
            <h3 class="tab-card-title">{{ cat.label }}</h3>
          </div>
          <table class="data-table">
            <thead><tr><th>Nombre</th><th>Fecha</th><th>Vencimiento</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr v-for="d in selectedAsociado.documentos.filter(x => x.categoria === cat.key)" :key="d.nombre">
                <td>
                  <div class="cell-doc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A90A0" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {{ d.nombre }}
                  </div>
                </td>
                <td>{{ d.fecha }}</td>
                <td>{{ d.vencimiento || '—' }}</td>
                <td><span class="badge" :class="`badge--${d.estadoClass}`">{{ d.estado }}</span></td>
                <td class="cell-actions">
                  <button class="action-btn" title="Descargar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                  <button class="action-btn" title="Ver"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </td>
              </tr>
              <tr v-if="!selectedAsociado.documentos.filter(x => x.categoria === cat.key).length">
                <td colspan="5" class="empty-row">Sin documentos en esta categoría</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── PESTAÑA: Comunicación ─── -->
      <div v-if="activeTab === 'comunicacion'" class="tab-panel">
        <div class="tab-card">
          <div class="tab-card-head">
            <h3 class="tab-card-title">Historial de comunicaciones</h3>
            <div class="filter-chips">
              <button v-for="f in ['Todos','Correo','SMS','Notificación','Comunicado']" :key="f"
                class="filter-chip"
                :class="filterComm === f ? 'filter-chip--active' : ''"
                @click="filterComm = f"
              >{{ f }}</button>
            </div>
          </div>
          <table class="data-table">
            <thead><tr><th>Canal</th><th>Asunto / Mensaje</th><th>Fecha</th><th>Leído</th></tr></thead>
            <tbody>
              <tr v-for="c in filteredComms" :key="c.asunto + c.fecha">
                <td>
                  <span class="badge"
                    :class="c.tipo === 'Correo' ? 'badge--blue' : c.tipo === 'SMS' ? 'badge--yellow' : c.tipo === 'Notificación' ? 'badge--purple' : 'badge--gray'">
                    {{ c.tipo }}
                  </span>
                </td>
                <td>{{ c.asunto }}</td>
                <td>{{ c.fecha }}</td>
                <td>
                  <svg v-if="c.leido" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </td>
              </tr>
              <tr v-if="!filteredComms.length"><td colspan="4" class="empty-row">Sin comunicaciones</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── PESTAÑA: Participación ─── -->
      <div v-if="activeTab === 'participacion'" class="tab-panel">
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--navy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div><div class="kpi-val">{{ selectedAsociado.asambleasAsistidas.length }}</div><div class="kpi-lbl">Asambleas asistidas</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div><div class="kpi-val">{{ selectedAsociado.asambleasAsistidas.filter(a => a.voto).length }}</div><div class="kpi-lbl">Votaciones realizadas</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-icon--purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div><div class="kpi-val">{{ selectedAsociado.comitesIntegrados.length }}</div><div class="kpi-lbl">Comités integrados</div></div>
          </div>
        </div>

        <div class="tab-card">
          <div class="tab-card-head"><h3 class="tab-card-title">Asambleas asistidas</h3></div>
          <table class="data-table">
            <thead><tr><th>Asamblea</th><th>Tipo</th><th>Fecha</th><th>Votó</th></tr></thead>
            <tbody>
              <tr v-for="a in selectedAsociado.asambleasAsistidas" :key="a.nombre + a.fecha">
                <td class="cell-bold">{{ a.nombre }}</td>
                <td><span class="badge badge--blue">{{ a.tipo }}</span></td>
                <td>{{ a.fecha }}</td>
                <td>
                  <svg v-if="a.voto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span v-else class="text-gray">—</span>
                </td>
              </tr>
              <tr v-if="!selectedAsociado.asambleasAsistidas.length"><td colspan="4" class="empty-row">Sin registros</td></tr>
            </tbody>
          </table>
        </div>

        <div class="tab-card">
          <div class="tab-card-head"><h3 class="tab-card-title">Comités integrados</h3></div>
          <table class="data-table">
            <thead><tr><th>Comité</th><th>Rol</th><th>Desde</th><th>Hasta</th></tr></thead>
            <tbody>
              <tr v-for="c in selectedAsociado.comitesIntegrados" :key="c.comite + c.desde">
                <td class="cell-bold">{{ c.comite }}</td>
                <td>{{ c.rol }}</td>
                <td>{{ c.desde }}</td>
                <td>
                  <span v-if="c.hasta === 'Presente'" class="badge badge--green">Presente</span>
                  <span v-else>{{ c.hasta }}</span>
                </td>
              </tr>
              <tr v-if="!selectedAsociado.comitesIntegrados.length"><td colspan="4" class="empty-row">Sin participación en comités</td></tr>
            </tbody>
          </table>
        </div>

        <div class="tab-card">
          <div class="tab-card-head"><h3 class="tab-card-title">Asociados a quien representa</h3></div>
          <table class="data-table">
            <thead><tr><th>Nombre</th><th>Fecha desde</th></tr></thead>
            <tbody>
              <tr v-for="r in selectedAsociado.representados" :key="r.nombre + r.desde">
                <td class="cell-bold">{{ r.nombre }}</td>
                <td>{{ r.desde }}</td>
              </tr>
              <tr v-if="!selectedAsociado.representados?.length"><td colspan="2" class="empty-row">No representa a ningún asociado</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </template><!-- /detalle -->

    <!-- ═══════════════════════════════════════
         MODAL FORMULARIO (registro / edición)
    ═══════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="formModal.open" class="modal-backdrop" @click.self="closeForm">
        <div class="modal-box modal-box--xl">
          <button class="modal-close" @click="closeForm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="modal-head">
            <h3 class="modal-title">{{ formModal.mode === 'nuevo' ? 'Registrar asociado' : 'Editar datos del asociado' }}</h3>
            <p class="modal-subtitle">{{ formModal.mode === 'nuevo' ? 'Complete la información del nuevo socio' : 'Actualice la información del expediente' }}</p>
          </div>

          <div class="modal-scrollbody">

            <!-- Datos personales -->
            <div class="fsection">
              <div class="fsection-title">Datos personales</div>
              <div class="frow">
                <div class="ffield ffield--2">
                  <label>Nombre completo <span class="req">*</span></label>
                  <input v-model="formData.nombre" type="text" placeholder="Apellido Apellido Nombre" />
                </div>
                <div class="ffield">
                  <label>Cédula de identidad <span class="req">*</span></label>
                  <input v-model="formData.cedula" type="text" placeholder="0-0000-0000" />
                </div>
              </div>
              <div class="frow">
                <div class="ffield">
                  <label>Fecha de nacimiento</label>
                  <DatePicker v-model="formData.fechaNac" />
                </div>
                <div class="ffield">
                  <label>Género</label>
                  <select v-model="formData.genero">
                    <option value="">Seleccionar</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>No especificar</option>
                  </select>
                </div>
                <div class="ffield">
                  <label>Estado civil</label>
                  <select v-model="formData.estadoCivil">
                    <option value="">Seleccionar</option>
                    <option>Soltero/a</option>
                    <option>Casado/a</option>
                    <option>Divorciado/a</option>
                    <option>Viudo/a</option>
                    <option>Unión libre</option>
                  </select>
                </div>
                <div class="ffield">
                  <label>Nacionalidad</label>
                  <input v-model="formData.nacionalidad" type="text" placeholder="Costarricense" />
                </div>
              </div>
            </div>

            <!-- Contactos -->
            <div class="fsection">
              <div class="fsection-title">Contactos</div>
              <div class="frow">
                <div class="ffield">
                  <label>Teléfono principal <span class="req">*</span></label>
                  <input v-model="formData.telPrincipal" type="tel" placeholder="8888-0000" />
                </div>
                <div class="ffield">
                  <label>Teléfono secundario</label>
                  <input v-model="formData.telSecundario" type="tel" placeholder="2222-0000" />
                </div>
                <div class="ffield">
                  <label>Correo electrónico</label>
                  <input v-model="formData.email" type="email" placeholder="correo@email.com" />
                </div>
              </div>
              <div class="frow">
                <div class="ffield ffield--full">
                  <label>Dirección</label>
                  <input v-model="formData.direccion" type="text" placeholder="Provincia, cantón, detalle de la dirección..." />
                </div>
              </div>
            </div>

            <!-- Afiliación -->
            <div class="fsection">
              <div class="fsection-title">Afiliación</div>
              <div class="frow">
                <div class="ffield">
                  <label>N° de asociado <span class="req">*</span></label>
                  <input v-model="formData.numAsociado" type="text" placeholder="A-000" />
                </div>
                <div class="ffield">
                  <label>Categoría</label>
                  <select v-model="formData.categoria">
                    <option>Activo</option>
                    <option>Honorario</option>
                    <option>Colaborador</option>
                  </select>
                </div>
                <div class="ffield">
                  <label>Fecha de ingreso</label>
                  <DatePicker v-model="formData.fechaIngreso" />
                </div>
              </div>
              <div class="frow">
                <div class="ffield">
                  <label>Aporte mensual (₡)</label>
                  <input v-model="formData.aporteMensual" type="number" min="0" placeholder="0" />
                </div>
                <div class="ffield">
                  <label>Estado</label>
                  <select v-model="formData.statusLabel">
                    <option>Activo</option>
                    <option>Pendiente</option>
                    <option>Inactivo</option>
                    <option>Suspendido</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Beneficiarios -->
            <div class="fsection">
              <div class="fsection-head">
                <div class="fsection-title" style="margin-bottom:0">Beneficiarios</div>
                <button type="button" class="btn-add-slim" @click="addBeneficiario">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar beneficiario
                </button>
              </div>
              <div class="ben-grid" v-if="formData.beneficiarios.length">
                <div class="ben-head">
                  <span>Nombre completo</span><span>Relación</span><span>Porcentaje</span><span></span>
                </div>
                <div v-for="(b, i) in formData.beneficiarios" :key="i" class="ben-row">
                  <input v-model="b.nombre" type="text" class="ben-input" placeholder="Nombre del beneficiario" />
                  <select v-model="b.relacion" class="ben-input">
                    <option value="">Seleccionar</option>
                    <option>Cónyuge</option>
                    <option>Hijo/a</option>
                    <option>Padre</option>
                    <option>Madre</option>
                    <option>Hermano/a</option>
                    <option>Otro</option>
                  </select>
                  <input v-model="b.porcentaje" type="number" min="0" max="100" class="ben-input ben-pct" placeholder="%" />
                  <button type="button" class="btn-remove" @click="formData.beneficiarios.splice(i,1)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="ben-total" :class="pctTotal !== 100 ? 'ben-total--warn' : 'ben-total--ok'">
                  Total: {{ pctTotal }}%
                  <span v-if="pctTotal !== 100" class="ben-warn-txt"> (debe sumar 100%)</span>
                </div>
              </div>
              <div v-else class="ben-empty">Sin beneficiarios agregados todavía</div>
            </div>

          </div><!-- /modal-scrollbody -->

          <div v-if="formError" class="ben-total ben-total--warn" style="margin: 0 24px;">{{ formError }}</div>

          <div class="modal-footer">
            <button class="btn-outline" @click="closeForm">Cancelar</button>
            <button class="btn-primary" :disabled="!formData.nombre || !formData.cedula || formSaving" @click="saveForm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ formModal.mode === 'nuevo' ? 'Registrar asociado' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { exportCSV, exportPDF } from '../composables/useExport.js'
import { useAuth } from '../composables/useAuth.js'
import {
  useAsociados, initialsOf,
  CATEGORIA_ENUM, ESTADO_ENUM, GENERO_ENUM, ESTADO_CIVIL_ENUM,
} from '../composables/useAsociados.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import DatePicker from '../components/DatePicker.vue'

const { cooperativaId } = useAuth()
const {
  list, getById, create, update, setBeneficiarios,
  getAsambleasAsistidas, getComitesIntegrados,
} = useAsociados()

/* ── Helpers ───────────────────────────── */
function fmt(n) {
  return Number(n).toLocaleString('es-CR')
}

/* ── Estado ────────────────────────────── */
const selectedAsociado = ref(null)
const loadError = ref(null)

// Al seleccionar un asociado con datos reales, completar la pestaña de
// Participacion (se deriva de Asambleas/Votaciones/Comites, no viene en list())
watch(selectedAsociado, async (a) => {
  if (!isSupabaseConfigured() || !a || a._participacionCargada) return
  const [{ data: asambleasAsistidas }, { data: comitesIntegrados }] = await Promise.all([
    getAsambleasAsistidas(a.id),
    getComitesIntegrados(a.id),
  ])
  a.asambleasAsistidas = asambleasAsistidas || []
  a.comitesIntegrados = comitesIntegrados || []
  a._participacionCargada = true
})
const activeTab = ref('expediente')
const searchQuery = ref('')
const filterEstado = ref('')
const filterCategoria = ref('')
const filterAportes = ref('')
const filterComm = ref('Todos')

/* ── Tabs ──────────────────────────────── */
const tabs = [
  { id: 'expediente',   label: 'Expediente' },
  { id: 'solicitudes',  label: 'Solicitudes' },
  { id: 'aportes',      label: 'Aportes' },
  { id: 'beneficios',   label: 'Beneficios' },
  { id: 'documentos',   label: 'Documentos' },
  { id: 'comunicacion', label: 'Comunicación' },
  { id: 'participacion', label: 'Participación' },
]

/* ── Catálogos ─────────────────────────── */
const beneficiosGrupos = [
  { key: 'Beca',     label: 'Becas' },
  { key: 'Auxilio',  label: 'Auxilios' },
  { key: 'Subsidio', label: 'Subsidios' },
  { key: 'Programa', label: 'Programas especiales' },
]
const docCategorias = [
  { key: 'Contratos',    label: 'Contratos' },
  { key: 'Formularios',  label: 'Formularios' },
  { key: 'Consentimientos', label: 'Consentimientos' },
]

const asociados = ref([])

async function loadAsociados() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await list()
  if (error) { loadError.value = error.message; return }
  asociados.value = data || []
}

onMounted(loadAsociados)

/* ── Resumen (tarjetas superiores) ───────── */
const summary = computed(() => {
  const now = new Date()
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return {
    activos: asociados.value.filter(a => a.statusLabel === 'Activo').length,
    nuevosMes: asociados.value.filter(a => a.fechaIngresoISO?.startsWith(mesActual)).length,
    pendientes: asociados.value.filter(a => a.statusLabel === 'Pendiente').length,
    enMora: asociados.value.filter(a => a.aporteBadge === 'red').length,
    capitalTotal: asociados.value.reduce((s, a) => s + (a.capitalSocial || 0), 0),
  }
})

/* ── Filtros lista ──────────────────────── */
const filteredAsociados = computed(() => {
  let list = asociados.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) list = list.filter(a =>
    a.name.toLowerCase().includes(q) || a.cedula.includes(q) || a.numAsociado.toLowerCase().includes(q)
  )
  if (filterEstado.value) list = list.filter(a => a.statusLabel === filterEstado.value)
  if (filterCategoria.value) list = list.filter(a => a.categoria === filterCategoria.value)
  if (filterAportes.value === 'Al día') list = list.filter(a => a.aporteBadge === 'green')
  if (filterAportes.value === 'En mora') list = list.filter(a => a.aporteBadge === 'red')
  return list
})

/* ── Form modal ─────────────────────────── */
const formModal = reactive({ open: false, mode: 'nuevo' })

const formData = reactive({
  nombre: '', cedula: '', numAsociado: '', fechaNac: '', genero: '',
  estadoCivil: '', nacionalidad: 'Costarricense', telPrincipal: '', telSecundario: '',
  email: '', direccion: '', categoria: 'Activo', fechaIngreso: '',
  aporteMensual: 0, statusLabel: 'Activo', beneficiarios: [],
})

const statusMap = { 'Activo': 'green', 'Pendiente': 'yellow', 'Inactivo': 'gray', 'Suspendido': 'red' }

const pctTotal = computed(() =>
  formData.beneficiarios.reduce((s, b) => s + (Number(b.porcentaje) || 0), 0)
)

function openForm(mode) {
  formModal.mode = mode
  if (mode === 'editar' && selectedAsociado.value) {
    const a = selectedAsociado.value
    Object.assign(formData, {
      nombre: a.name, cedula: a.cedula, numAsociado: a.numAsociado,
      fechaNac: a.fechaNac || '', genero: a.genero || '',
      estadoCivil: a.estadoCivil || '', nacionalidad: a.nacionalidad || 'Costarricense',
      telPrincipal: a.telPrincipal || '', telSecundario: a.telSecundario || '',
      email: a.email || '', direccion: a.direccion || '',
      categoria: a.categoria || 'Activo', fechaIngreso: a.fechaIngreso || '',
      aporteMensual: a.aporteMensual || 0, statusLabel: a.statusLabel || 'Activo',
      beneficiarios: JSON.parse(JSON.stringify(a.beneficiarios || [])),
    })
  } else {
    Object.assign(formData, {
      nombre: '', cedula: '', numAsociado: '', fechaNac: '', genero: '',
      estadoCivil: '', nacionalidad: 'Costarricense', telPrincipal: '', telSecundario: '',
      email: '', direccion: '', categoria: 'Activo', fechaIngreso: '',
      aporteMensual: 0, statusLabel: 'Activo', beneficiarios: [],
    })
  }
  formModal.open = true
}

function closeForm() { formModal.open = false; formError.value = null }

function addBeneficiario() {
  formData.beneficiarios.push({ nombre: '', relacion: '', porcentaje: '' })
}

const formError = ref(null)
const formSaving = ref(false)

async function saveForm() {
  if (!formData.nombre || !formData.cedula) return

  if (!isSupabaseConfigured()) {
    if (formModal.mode === 'editar' && selectedAsociado.value) {
      const a = selectedAsociado.value
      Object.assign(a, {
        name: formData.nombre,
        initials: formData.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(),
        cedula: formData.cedula, numAsociado: formData.numAsociado,
        fechaNac: formData.fechaNac, genero: formData.genero,
        estadoCivil: formData.estadoCivil, nacionalidad: formData.nacionalidad,
        telPrincipal: formData.telPrincipal, telSecundario: formData.telSecundario,
        email: formData.email, direccion: formData.direccion,
        categoria: formData.categoria, fechaIngreso: formData.fechaIngreso,
        aporteMensual: Number(formData.aporteMensual), statusLabel: formData.statusLabel,
        status: statusMap[formData.statusLabel] || 'gray',
        beneficiarios: JSON.parse(JSON.stringify(formData.beneficiarios)),
      })
    } else {
      const initials = formData.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
      const palette = ['#133C65', '#1A9152', '#7B3FA0', '#C47F0C', '#00808C', '#C0392B']
      const color = palette[asociados.value.length % palette.length]
      const today = new Date().toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      asociados.value.push({
        id: Date.now(), name: formData.nombre, initials, color,
        cedula: formData.cedula, numAsociado: formData.numAsociado,
        categoria: formData.categoria, capitalSocial: 0,
        aporteMensual: Number(formData.aporteMensual), aporteBadge: 'green',
        fechaIngreso: formData.fechaIngreso || today,
        status: statusMap[formData.statusLabel] || 'yellow',
        statusLabel: formData.statusLabel,
        fechaNac: formData.fechaNac, genero: formData.genero,
        estadoCivil: formData.estadoCivil, nacionalidad: formData.nacionalidad,
        telPrincipal: formData.telPrincipal, telSecundario: formData.telSecundario,
        email: formData.email, direccion: formData.direccion,
        beneficiarios: JSON.parse(JSON.stringify(formData.beneficiarios)),
        solicitudes: [], aportes: [], beneficiosHist: [], documentos: [], comunicaciones: [],
        asambleasAsistidas: [], comitesIntegrados: [], representados: [],
      })
    }
    closeForm()
    return
  }

  formSaving.value = true
  formError.value = null
  const isEdit = formModal.mode === 'editar' && selectedAsociado.value
  const { data, error } = isEdit ? await update(selectedAsociado.value.id, formData) : await create(cooperativaId.value, formData)
  if (error) { formSaving.value = false; formError.value = error.message; return }

  const { error: benErr } = await setBeneficiarios(data.id, formData.beneficiarios)
  formSaving.value = false
  if (benErr) { formError.value = benErr.message; return }

  const { data: fresco } = await getById(data.id)
  if (fresco) {
    if (isEdit) Object.assign(selectedAsociado.value, fresco)
    else selectedAsociado.value = fresco
  }
  await loadAsociados()
  closeForm()
}

/* ── Filtro comunicaciones ─────────────── */
const filteredComms = computed(() => {
  if (!selectedAsociado.value) return []
  const comms = selectedAsociado.value.comunicaciones
  if (filterComm.value === 'Todos') return comms
  return comms.filter(c => c.tipo === filterComm.value)
})
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }

/* ── Encabezado ─────────────────────────── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

/* ── KPI cards (lista) ──────────────────── */
.summary-row { display: flex; gap: 14px; flex-wrap: wrap; }
.summary-card {
  flex: 1; min-width: 130px; background: white; border: 1px solid #E8EEF4;
  border-radius: 10px; padding: 14px 18px; display: flex; flex-direction: column;
  gap: 2px; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .summary-card { background: #1D293D; border-color: #3D5069; }
.summary-num { font-size: 26px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; line-height: 1; }
.dark .summary-num { color: #E2E8F0; }
.summary-lbl { font-size: 12px; color: #7A90A0; font-weight: 500; }

/* ── Filtros ────────────────────────────── */
.filters-bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.export-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.export-btn { width: 34px; height: 34px; background: none; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.export-btn--excel { color: #217346; border: 1.5px solid #C8E6C9; }
.export-btn--excel:hover { background: rgba(33,115,70,0.08); border-color: #217346; }
.export-btn--pdf { color: #C0392B; border: 1.5px solid #FFCDD2; }
.export-btn--pdf:hover { background: rgba(192,57,43,0.08); border-color: #C0392B; }
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 360px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #7A90A0; pointer-events: none; }
.search-input {
  width: 100%; height: 38px; padding: 0 12px 0 36px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .search-input { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }
.search-input:focus { border-color: #133C65; }
.filter-select {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; cursor: pointer; outline: none;
}
.dark .filter-select { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

/* ── Data card / tabla ──────────────────── */
.data-card {
  background: white; border-radius: 12px;
  border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 11px 14px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 12px 14px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #3D5069; }
.data-table tbody tr:hover { background: #F8FAFC; cursor: pointer; }
.dark .data-table tbody tr:hover { background: rgba(255,255,255,0.04); }
.data-table tbody tr:last-child td { border-bottom: none; }
.cell-bold { font-weight: 600; }
.cell-mono { font-family: monospace; font-size: 13px; color: #4A6070; }
.dark .cell-mono { color: #94A3B8; }
.cell-num-right { font-variant-numeric: tabular-nums; text-align: right; font-weight: 600; }
.cell-actions { white-space: nowrap; }
.empty-row { text-align: center; color: #B0C0D0; font-size: 13px; padding: 24px !important; }

.cell-user { display: flex; align-items: center; gap: 10px; }
.cell-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cell-name { font-weight: 600; font-size: 13.5px; color: #1A2B3C; }
.dark .cell-name { color: #E2E8F0; }
.cell-num { font-size: 11.5px; color: #7A90A0; font-family: monospace; }

/* ── Badges ─────────────────────────────── */
.badge { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.badge--green  { background: rgba(26,145,82,0.12);  color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.badge--red    { background: rgba(192,57,43,0.12);  color: #9B2335; }
.badge--blue   { background: rgba(19,60,101,0.1);   color: #133C65; }
.badge--purple { background: rgba(123,63,160,0.12); color: #5C2D91; }
.badge--cat    { background: rgba(0,128,140,0.1);   color: #006B75; font-size: 11px; }
.dark .badge--green  { background: rgba(74,222,128,0.15);   color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);   color: #FBBF24; }
.dark .badge--gray   { background: rgba(148,163,184,0.18);  color: #94A3B8; }
.dark .badge--red    { background: rgba(248,113,113,0.18);  color: #F87171; }
.dark .badge--blue   { background: rgba(96,165,250,0.18);   color: #60A5FA; }
.dark .badge--purple { background: rgba(192,132,252,0.18);  color: #C084FC; }
.dark .badge--cat    { background: rgba(45,212,191,0.18);   color: #2DD4BF; }

/* ── Action btn ─────────────────────────── */
.action-btn {
  background: none; border: none; color: #7A90A0; cursor: pointer;
  padding: 5px; border-radius: 5px; display: inline-flex; align-items: center;
  vertical-align: middle; transition: color 0.12s, background 0.12s;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }

/* ── Detalle: encabezado ────────────────── */
.detail-header { display: flex; flex-direction: column; gap: 12px; }
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: none; padding: 0; cursor: pointer; transition: opacity 0.15s;
  align-self: flex-start;
}
.dark .back-btn { color: #93B8D8; }
.back-btn:hover { opacity: 0.7; }
.detail-title-row { display: flex; align-items: center; gap: 14px; }
.detail-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  color: white; font-size: 16px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.detail-name { font-size: 20px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .detail-name { color: #E2E8F0; }
.detail-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #7A90A0; margin-top: 2px; flex-wrap: wrap; }
.meta-dot { color: #D4E4F4; }

/* ── Pestañas ───────────────────────────── */
.tabs-nav-wrap {
  background: white; border: 1px solid #E8EEF4; border-radius: 10px;
  padding: 0 6px; overflow-x: auto;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .tabs-nav-wrap { background: #1D293D; border-color: #3D5069; }
.tabs-nav { display: flex; gap: 2px; min-width: max-content; }
.tab-btn {
  background: none; border: none; padding: 12px 16px;
  font-size: 13.5px; font-weight: 500; color: #7A90A0; cursor: pointer;
  border-bottom: 2.5px solid transparent; transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.tab-btn:hover { color: #133C65; }
.dark .tab-btn:hover { color: #93B8D8; }
.tab-btn--active { color: #133C65; font-weight: 700; border-bottom-color: #133C65; }
.dark .tab-btn--active { color: #93B8D8; border-bottom-color: #93B8D8; }

/* ── Contenido de tabs ──────────────────── */
.tab-panel { display: flex; flex-direction: column; gap: 16px; }

/* ── Tab card ───────────────────────────── */
.tab-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .tab-card { background: #1D293D; border-color: #3D5069; }
.tab-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 18px; border-bottom: 1px solid #F0F4F8;
}
.dark .tab-card-head { border-color: #3D5069; }
.tab-card-title { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .tab-card-title { color: #E2E8F0; }

/* ── Expediente layout ──────────────────── */
.expediente-layout { display: flex; gap: 18px; align-items: flex-start; }

.exp-sidebar {
  width: 220px; flex-shrink: 0;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 20px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); position: sticky; top: 0;
}
.dark .exp-sidebar { background: #1D293D; border-color: #3D5069; }
.exp-sidebar-avatar {
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
  color: white; font-size: 22px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
}
.exp-sidebar-name { font-size: 14px; font-weight: 700; color: #133C65; text-align: center; }
.dark .exp-sidebar-name { color: #E2E8F0; }
.exp-sidebar-num { font-size: 12px; font-family: monospace; color: #7A90A0; }
.exp-sidebar-divider { width: 100%; height: 1px; background: #F0F4F8; margin: 6px 0; }
.dark .exp-sidebar-divider { background: #3D5069; }

.exp-quick-fact { display: flex; flex-direction: column; gap: 1px; width: 100%; }
.eq-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #B0C0D0; }
.eq-val { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .eq-val { color: #E2E8F0; }

.exp-main { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0; }

.exp-section {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 18px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .exp-section { background: #1D293D; border-color: #3D5069; }
.exp-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #7A90A0; margin-bottom: 14px; }
.exp-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

.exp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.exp-field { display: flex; flex-direction: column; gap: 3px; }
.exp-field--full { grid-column: 1 / -1; }
.ef-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #B0C0D0; }
.ef-val { font-size: 14px; font-weight: 500; color: #1A2B3C; }
.dark .ef-val { color: #E2E8F0; }
.ef-val--mono { font-family: monospace; }

/* Tabla interna beneficiarios */
.inner-table { width: 100%; border-collapse: collapse; }
.inner-table th {
  text-align: left; padding: 9px 12px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .inner-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.inner-table td { padding: 10px 12px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; }
.dark .inner-table td { color: #E2E8F0; border-color: #3D5069; }
.inner-table tbody tr:last-child td { border-bottom: none; }

.pct-bar-wrap { display: flex; align-items: center; gap: 8px; }
.pct-bar { height: 6px; border-radius: 3px; background: #133C65; min-width: 4px; }
.pct-val { font-size: 13px; font-weight: 600; color: #133C65; white-space: nowrap; }
.dark .pct-val { color: #93B8D8; }

/* ── KPI cards (tabs) ────────────────────── */
.kpi-row { display: flex; gap: 14px; flex-wrap: wrap; }
.kpi-card {
  flex: 1; min-width: 130px; background: white; border: 1px solid #E8EEF4; border-radius: 10px;
  padding: 14px 18px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .kpi-card { background: #1D293D; border-color: #3D5069; }
.kpi-icon {
  width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.kpi-icon--navy   { background: #133C65; }
.kpi-icon--green  { background: #1A9152; }
.kpi-icon--purple { background: #7B3FA0; }
.kpi-icon--red    { background: #C0392B; }
.kpi-val { font-size: 20px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; line-height: 1; }
.dark .kpi-val { color: #E2E8F0; }
.kpi-lbl { font-size: 12px; color: #7A90A0; margin-top: 2px; }

/* ── Documentos ─────────────────────────── */
.cell-doc { display: flex; align-items: center; gap: 8px; font-weight: 600; }

/* ── Comunicación chips ─────────────────── */
.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  font-size: 12px; font-weight: 600; background: #F4F6F8; color: #4A6070;
  border: 1.5px solid #E8EEF4; padding: 4px 12px; border-radius: 20px;
  cursor: pointer; transition: all 0.15s;
}
.filter-chip:hover { border-color: #133C65; color: #133C65; }
.filter-chip--active { background: #133C65; color: white; border-color: #133C65; }
.dark .filter-chip { background: #2D3F55; color: #94A3B8; border-color: #3D5069; }
.dark .filter-chip--active { background: #133C65; color: white; }

/* ── Botones ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }
.btn-sm { padding: 6px 13px; font-size: 12.5px; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }
.dark .btn-outline { color: #93B8D8; border-color: #3D5069; }

.btn-outline-full {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px; border-radius: 8px;
  cursor: pointer; margin-top: 6px; transition: all 0.15s;
}
.btn-outline-full:hover { background: #EBF3FF; border-color: #133C65; }
.dark .btn-outline-full { color: #93B8D8; border-color: #3D5069; }

.btn-add-slim {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 5px 12px;
  border-radius: 7px; cursor: pointer; transition: all 0.15s;
}
.btn-add-slim:hover { background: #EBF3FF; border-color: #133C65; }

.text-gray { color: #B0C0D0; }

/* ── th alineación derecha ──────────────── */
.th-right { text-align: right !important; }

/* ── Modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.55);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px;
  width: 100%; max-width: 520px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22);
  display: flex; flex-direction: column; max-height: 90vh;
}
.modal-box--xl { max-width: 780px; }
.dark .modal-box { background: #1D293D; }
.modal-close {
  position: absolute; top: 14px; right: 14px; z-index: 1;
  width: 28px; height: 28px; border-radius: 7px; background: #F4F6F8;
  border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }
.modal-head { padding: 22px 24px 16px; flex-shrink: 0; }
.modal-title { font-size: 18px; font-weight: 700; color: #133C65; margin-bottom: 2px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 13px; color: #7A90A0; }
.modal-scrollbody { flex: 1; overflow-y: auto; padding: 0 24px; display: flex; flex-direction: column; gap: 0; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid #F0F4F8; flex-shrink: 0;
}
.dark .modal-footer { border-color: #3D5069; }

/* ── Formulario secciones ───────────────── */
.fsection { padding: 18px 0; border-bottom: 1px solid #F0F4F8; }
.dark .fsection { border-color: #3D5069; }
.fsection:last-child { border-bottom: none; }
.fsection-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: #133C65; margin-bottom: 14px; padding-bottom: 8px;
  border-bottom: 1.5px solid #E8EEF4;
}
.dark .fsection-title { color: #93B8D8; border-color: #3D5069; }
.fsection-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

.frow { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 12px; }
.frow:last-child { margin-bottom: 0; }
.ffield { display: flex; flex-direction: column; gap: 5px; }
.ffield--2 { grid-column: span 2; }
.ffield--full { grid-column: 1 / -1; }
.ffield label { font-size: 12px; font-weight: 600; color: #4A6070; }
.dark .ffield label { color: #94A3B8; }
.ffield input, .ffield select {
  height: 38px; padding: 0 11px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .ffield input, .dark .ffield select { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.ffield input:focus, .ffield select:focus { border-color: #133C65; }
.req { color: #C0392B; }

/* ── Beneficiarios en form ──────────────── */
.ben-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid #E8EEF4; border-radius: 9px; overflow: hidden; margin-top: 12px; }
.dark .ben-grid { border-color: #3D5069; }
.ben-head {
  display: grid; grid-template-columns: 1fr 1fr 90px 36px;
  padding: 8px 12px; background: #F8FAFC; gap: 8px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #7A90A0;
  border-bottom: 1px solid #E8EEF4;
}
.dark .ben-head { background: #162033; border-color: #3D5069; color: #64748B; }
.ben-row {
  display: grid; grid-template-columns: 1fr 1fr 90px 36px;
  padding: 8px 10px; gap: 8px; align-items: center;
  border-bottom: 1px solid #F0F4F8;
}
.dark .ben-row { border-color: #3D5069; }
.ben-row:last-child { border-bottom: none; }
.ben-input {
  height: 34px; padding: 0 9px;
  border: 1.5px solid #D4E4F4; border-radius: 6px;
  font-size: 13px; font-family: inherit; background: white; color: #1A2B3C; outline: none; width: 100%;
}
.dark .ben-input { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.ben-input:focus { border-color: #133C65; }
.ben-pct { text-align: center; }
.btn-remove {
  width: 28px; height: 28px; background: none; border: none; cursor: pointer;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  color: #B0C0D0; transition: color 0.12s, background 0.12s; flex-shrink: 0;
}
.btn-remove:hover { color: #C0392B; background: rgba(192,57,43,0.08); }
.ben-total {
  padding: 8px 12px; font-size: 12.5px; font-weight: 600; background: #F8FAFC; text-align: right;
  border-top: 1px solid #E8EEF4;
}
.dark .ben-total { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.ben-total--ok  { color: #1A6B42; }
.ben-total--warn { color: #8A5800; }
.ben-warn-txt { font-size: 11.5px; font-weight: 400; }
.ben-empty { font-size: 13px; color: #B0C0D0; padding: 12px 0; }

/* ── Modal transitions ──────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 900px) {
  .expediente-layout { flex-direction: column; }
  .exp-sidebar { width: 100%; position: static; flex-direction: row; flex-wrap: wrap; gap: 10px; }
  .exp-sidebar-avatar { width: 48px; height: 48px; font-size: 16px; }
  .exp-grid { grid-template-columns: 1fr; }
  .kpi-row { gap: 10px; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
  .data-card { overflow-x: auto; }
  .frow { grid-template-columns: 1fr !important; }
  .filter-bar { flex-wrap: wrap; gap: 8px; }
  .filter-bar input, .filter-bar select { width: 100%; }
}
</style>
