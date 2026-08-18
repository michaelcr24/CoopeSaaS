<template>
  <div class="module-page">

    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Personal</h2>
        <p class="page-subtitle">Gestión de colaboradores y recursos humanos</p>
      </div>
      <button v-if="activeTab === 'dashboard'" class="btn-primary" @click="openModal('nuevo')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar colaborador
      </button>
    </div>

    <!-- Pestañas -->
    <div class="tabs-wrap">
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span v-html="tab.icon"></span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         TAB: DASHBOARD
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'dashboard'">
      <div class="indicators-grid">
        <div v-for="ind in indicators" :key="ind.key" class="indicator-card">
          <div class="ind-icon" :style="{ background: ind.bg }">
            <span v-html="ind.icon"></span>
          </div>
          <div class="ind-body">
            <span class="ind-value">{{ ind.value }}</span>
            <span class="ind-label">{{ ind.label }}</span>
          </div>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="search" placeholder="Buscar por nombre, puesto..." class="search-input" />
        </div>
        <select v-model="filterDept" class="filter-select">
          <option value="">Todos los departamentos</option>
          <option v-for="d in departamentos" :key="d.id" :value="d.nombre">{{ d.nombre }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel"
            @click="exportExcel(filteredEmployees, [{key:'name',label:'Nombre'},{key:'role',label:'Puesto'},{key:'dept',label:'Departamento'},{key:'date',label:'Fecha ingreso'}], 'colaboradores')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF"
            @click="exportPDF(filteredEmployees, [{key:'name',label:'Nombre'},{key:'role',label:'Puesto'},{key:'dept',label:'Departamento'},{key:'date',label:'Fecha ingreso'}], 'Colaboradores')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Puesto</th>
              <th>Departamento</th>
              <th>Fecha ingreso</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                  <span>{{ nombreCompleto(emp) }}</span>
                </div>
              </td>
              <td>{{ emp.role }}</td>
              <td>{{ emp.dept }}</td>
              <td>{{ emp.date }}</td>
              <td><span class="badge" :class="emp.active ? 'badge--green' : 'badge--gray'">{{ emp.active ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver expediente" @click="selectedEmp = emp; activeTab='expedientes'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Editar" @click="openModal('editar', emp)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn action-btn--red" title="Eliminar" @click="confirmarEliminarEmpleado(emp)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredEmployees.length === 0">
              <td colspan="6" class="empty-row">No se encontraron colaboradores.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: EXPEDIENTES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'expedientes'">
      <div class="exp-layout">
        <!-- Lista lateral -->
        <div class="exp-sidebar">
          <div class="exp-search-wrap">
            <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="expedientesSearch" type="search" placeholder="Buscar..." class="search-input search-input--sm" />
          </div>
          <div class="exp-list">
            <div v-if="!filteredExpedientesEmployees.length" class="exp-mini-empty" style="padding: 12px;">Sin resultados</div>
            <div
              v-for="emp in filteredExpedientesEmployees"
              :key="emp.id"
              class="exp-item"
              :class="{ 'exp-item--active': selectedEmp?.id === emp.id }"
              @click="selectedEmp = emp"
            >
              <div class="cell-avatar cell-avatar--sm" :style="{ background: emp.color }">{{ emp.initials }}</div>
              <div class="exp-item-info">
                <span class="exp-item-name">{{ nombreCompleto(emp) }}</span>
                <span class="exp-item-role">{{ emp.role }}</span>
              </div>
              <span class="badge badge--xs" :class="emp.active ? 'badge--green' : 'badge--gray'">
                {{ emp.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Detalle -->
        <div class="exp-detail" v-if="selectedEmp">
          <div class="exp-detail-header">
            <div class="cell-avatar cell-avatar--lg" :style="{ background: selectedEmp.color }">{{ selectedEmp.initials }}</div>
            <div>
              <h3 class="exp-name">{{ nombreCompleto(selectedEmp) }}</h3>
              <p class="exp-role">{{ selectedEmp.role }} · {{ selectedEmp.dept }}</p>
            </div>
            <div class="exp-header-actions">
              <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportarExpedientePDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
              </button>
              <button class="btn-outline btn-sm" @click="openModal('editar', selectedEmp)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar expediente
              </button>
            </div>
          </div>

          <div class="exp-sections">
            <div class="exp-section">
              <h4 class="exp-section-title">Información personal</h4>
              <div class="exp-grid">
                <div class="exp-field"><label>Nombre completo</label><span>{{ nombreCompleto(selectedEmp) || '—' }}</span></div>
                <div class="exp-field"><label>Identificación</label><span>{{ selectedEmp.identificacion || '—' }}<span v-if="selectedEmp.tipoIdentificacion"> ({{ selectedEmp.tipoIdentificacion }})</span></span></div>
                <div class="exp-field"><label>Fecha de nacimiento</label><span>{{ selectedEmp.fechaNacimiento ? inputDateToDdmmyyyy(selectedEmp.fechaNacimiento) : '—' }}</span></div>
                <div class="exp-field"><label>Nacionalidad</label><span>{{ selectedEmp.nacionalidad || '—' }}</span></div>
                <div class="exp-field"><label>Sexo</label><span>{{ selectedEmp.genero || '—' }}</span></div>
                <div class="exp-field"><label>Estado civil</label><span>{{ selectedEmp.estadoCivil || '—' }}</span></div>
                <div class="exp-field"><label>Teléfono principal</label><span>{{ selectedEmp.telefono || '—' }}</span></div>
                <div class="exp-field"><label>Teléfono secundario</label><span>{{ selectedEmp.telefonoSecundario || '—' }}</span></div>
                <div class="exp-field"><label>Correo personal</label><span>{{ selectedEmp.correoPersonal || '—' }}</span></div>
                <div class="exp-field"><label>Correo institucional</label><span>{{ selectedEmp.correoInstitucional || '—' }}</span></div>
                <div class="exp-field exp-field--full"><label>Dirección</label><span>{{ [selectedEmp.provincia, selectedEmp.canton, selectedEmp.distrito, selectedEmp.direccionExacta].filter(Boolean).join(', ') || '—' }}</span></div>
              </div>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Información laboral</h4>
              <div class="exp-grid">
                <div class="exp-field"><label>Código interno</label><span>{{ selectedEmp.codigoInterno || '—' }}</span></div>
                <div class="exp-field"><label>Fecha de ingreso</label><span>{{ selectedEmp.date }}</span></div>
                <div class="exp-field"><label>Departamento</label><span>{{ selectedEmp.dept }}</span></div>
                <div class="exp-field"><label>Puesto</label><span>{{ selectedEmp.role }}</span></div>
                <div class="exp-field"><label>Jefatura inmediata</label><span>{{ jefeOptions.find(j => j.id === selectedEmp.jefeInmediatoId)?.name || '—' }}</span></div>
                <div class="exp-field"><label>Sede</label><span>{{ nombreEnCatalogo(selectedEmp.sedeId, sedes) || '—' }}</span></div>
                <div class="exp-field"><label>Tipo de contratación</label><span>{{ selectedEmp.tipoContrato || '—' }}</span></div>
                <div class="exp-field"><label>Jornada</label><span>{{ nombreEnCatalogo(selectedEmp.jornadaId, jornadas) || '—' }}</span></div>
                <div class="exp-field"><label>Horario</label><span>{{ nombreEnCatalogo(selectedEmp.horarioId, horarios) || '—' }}</span></div>
                <div class="exp-field"><label>Estado</label><span>{{ selectedEmp.active ? 'Activo' : 'Inactivo' }}</span></div>
                <div class="exp-field"><label>Salario base</label><span>{{ selectedEmp.salario ? (selectedEmp.moneda || 'CRC') + ' ' + Number(selectedEmp.salario).toLocaleString('es-CR') : '—' }}</span></div>
                <div class="exp-field"><label>Forma de pago</label><span>{{ selectedEmp.formaPago || '—' }}</span></div>
              </div>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Contactos de emergencia</h4>
              <ul class="exp-mini-list">
                <li v-if="!dContactos.length" class="exp-mini-empty">Sin contactos registrados</li>
                <li v-for="c in dContactos" :key="c.id" class="exp-mini-item">
                  <div>
                    <strong>{{ c.nombre_completo }}</strong> <span v-if="c.es_principal" class="badge badge--green">Principal</span>
                    <div class="exp-mini-sub">{{ c.parentesco }} · {{ c.telefono_principal }}</div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Contratos</h4>
              <ul class="exp-mini-list">
                <li v-if="!dContratos.length" class="exp-mini-empty">Sin contratos registrados</li>
                <li v-for="c in dContratos" :key="c.id" class="exp-mini-item">
                  <div>
                    <strong>{{ c.numero_contrato || 'Sin número' }}</strong> <span class="badge badge--blue">{{ c.estado_contrato }}</span>
                    <div class="exp-mini-sub">Desde {{ c.fecha_inicio }}<span v-if="c.fecha_fin"> hasta {{ c.fecha_fin }}</span></div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Formación académica</h4>
              <ul class="exp-mini-list">
                <li v-if="!dFormacionAcademica.length" class="exp-mini-empty">Sin estudios registrados</li>
                <li v-for="f in dFormacionAcademica" :key="f.id" class="exp-mini-item">
                  <div><strong>{{ f.titulo_obtenido || f.nivel_academico }}</strong><div class="exp-mini-sub">{{ f.nivel_academico }}<span v-if="f.profesion"> · {{ f.profesion }}</span></div></div>
                </li>
              </ul>
              <p v-if="dColegiaturas.length" class="exp-subtitle" style="margin-top:10px">Colegiatura profesional</p>
              <ul class="exp-mini-list">
                <li v-for="c in dColegiaturas" :key="c.id" class="exp-mini-item">
                  <div><strong>N° {{ c.numero_colegiado || '—' }}</strong> <span class="badge badge--blue">{{ c.estado }}</span></div>
                </li>
              </ul>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Certificaciones y cursos</h4>
              <ul class="exp-mini-list">
                <li v-if="!dCertificaciones.length && !dCursos.length" class="exp-mini-empty">Sin certificaciones ni cursos registrados</li>
                <li v-for="c in dCertificaciones" :key="'cert-' + c.id" class="exp-mini-item">
                  <div><strong>{{ c.nombre }}</strong> <span class="badge badge--blue">{{ c.estado }}</span><div class="exp-mini-sub">{{ c.institucion_certificadora }}</div></div>
                </li>
                <li v-for="c in dCursos" :key="'curso-' + c.id" class="exp-mini-item">
                  <div><strong>{{ c.nombre_curso }}</strong><div class="exp-mini-sub">{{ c.institucion }} · {{ c.modalidad }}</div></div>
                </li>
              </ul>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Información bancaria</h4>
              <p v-if="dBancariosSinAcceso" class="exp-hint">No tienes acceso a esta información.</p>
              <div v-else class="exp-grid">
                <div class="exp-field"><label>Banco</label><span>{{ dBancarios.banco || '—' }}</span></div>
                <div class="exp-field"><label>Tipo de cuenta</label><span>{{ dBancarios.tipo_cuenta || '—' }}</span></div>
                <div class="exp-field"><label>Número de cuenta</label><span>{{ dBancarios.numero_cuenta || '—' }}</span></div>
                <div class="exp-field"><label>IBAN</label><span>{{ dBancarios.iban || '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="exp-empty" v-else>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>Selecciona un colaborador para ver su expediente</p>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: VACACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'vacaciones'">
      <div class="vac-summary">
        <div class="vac-saldo">
          <span class="vac-num">{{ vacacionesStats.total }}</span>
          <span class="vac-lbl">Solicitudes totales</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ vacacionesStats.diasAprobados }}</span>
          <span class="vac-lbl">Días aprobados</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ vacacionesStats.pendientes }}</span>
          <span class="vac-lbl">Solicitudes pendientes</span>
        </div>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportExcel(vacacionesFiltradas,[{key:'numeroSolicitud',label:'N° Solicitud'},{key:'name',label:'Colaborador'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'status',label:'Estado'}],'vacaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF(vacacionesFiltradas,[{key:'numeroSolicitud',label:'N° Solicitud'},{key:'name',label:'Colaborador'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'status',label:'Estado'}],'Vacaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary vac-btn" @click="abrirNuevaVacacion">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva solicitud
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="vacFiltroNumero" type="search" placeholder="N° de solicitud..." class="search-input" />
        </div>
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="vacFiltroNombre" type="search" placeholder="Nombre del colaborador..." class="search-input" />
        </div>
        <div class="filter-date"><DatePicker v-model="vacFiltroFecha" placeholder="Fecha" /></div>
        <select v-model="vacFiltroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Solicitud</th>
              <th>Colaborador</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vacacionesFiltradas" :key="v.id">
              <td>{{ v.numeroSolicitud }}</td>
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: v.color }">{{ v.initials }}</div>
                  <span>{{ v.name }}</span>
                </div>
              </td>
              <td>{{ v.inicio }}</td>
              <td>{{ v.fin }}</td>
              <td>{{ v.dias }}</td>
              <td><span class="badge" :class="`badge--${v.statusClass}`">{{ v.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver / revisar solicitud" @click="abrirRevisarVacacion(v)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn action-btn--red" title="Eliminar" @click="confirmarEliminarVacacion(v)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <button class="action-btn" title="Descargar boleta" @click="exportarBoletaVacacion(v)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="vacacionesFiltradas.length === 0">
              <td colspan="7" class="empty-row">Sin solicitudes de vacaciones.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: PERMISOS
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'permisos'">
      <div class="vac-summary">
        <div class="vac-saldo">
          <span class="vac-num">{{ permisosStats.total }}</span>
          <span class="vac-lbl">Solicitudes totales</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ permisosStats.horasAprobadas }}</span>
          <span class="vac-lbl">Horas aprobadas</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ permisosStats.pendientes }}</span>
          <span class="vac-lbl">Solicitudes pendientes</span>
        </div>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportExcel(permisosFiltrados,[{key:'numeroSolicitud',label:'N° Solicitud'},{key:'name',label:'Colaborador'},{key:'tipoPermiso',label:'Tipo'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'status',label:'Estado'}],'permisos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF(permisosFiltrados,[{key:'numeroSolicitud',label:'N° Solicitud'},{key:'name',label:'Colaborador'},{key:'tipoPermiso',label:'Tipo'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'status',label:'Estado'}],'Permisos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary vac-btn" @click="abrirNuevoPermiso">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva solicitud
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="permFiltroNumero" type="search" placeholder="N° de solicitud..." class="search-input" />
        </div>
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="permFiltroNombre" type="search" placeholder="Nombre del colaborador..." class="search-input" />
        </div>
        <div class="filter-date"><DatePicker v-model="permFiltroFecha" placeholder="Fecha" /></div>
        <select v-model="permFiltroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Solicitud</th>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Duración</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in permisosFiltrados" :key="p.id">
              <td>{{ p.numeroSolicitud }}</td>
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td><span class="badge badge--blue">{{ p.tipoPermiso }}</span></td>
              <td>{{ p.inicio }}</td>
              <td>{{ p.fin }}</td>
              <td>{{ p.horas != null ? p.horas + ' h' : (p.dias != null ? p.dias + ' día(s)' : '—') }}</td>
              <td><span class="badge" :class="`badge--${p.statusClass}`">{{ p.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver / revisar solicitud" @click="abrirRevisarPermiso(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn action-btn--red" title="Eliminar" @click="confirmarEliminarPermiso(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <button class="action-btn" title="Descargar boleta" @click="exportarBoletaPermiso(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="permisosFiltrados.length === 0">
              <td colspan="8" class="empty-row">Sin solicitudes de permisos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: DOCUMENTOS
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'documentos'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Gestión documental</h3>
          <p class="section-desc">Documentos personales, laborales y académicos de los colaboradores</p>
        </div>
      </div>

      <div class="exp-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>Sin documentos registrados. La gestión documental de expedientes estará disponible próximamente.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: ASISTENCIA
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'asistencia'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Control de asistencia</h3>
          <p class="section-desc">Registro de entradas, salidas y horas trabajadas</p>
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas trabajadas</th>
              <th>Horas extra</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in asistencias" :key="a.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                  <span>{{ a.name }}</span>
                </div>
              </td>
              <td>{{ a.fecha }}</td>
              <td>
                <span class="time-badge">{{ a.entrada }}</span>
              </td>
              <td>
                <span class="time-badge" v-if="a.salida">{{ a.salida }}</span>
                <span class="time-badge time-badge--pending" v-else>Pendiente</span>
              </td>
              <td>
                <span class="font-mono">{{ a.horas ? a.horas + 'h' : '—' }}</span>
              </td>
              <td>
                <span v-if="a.extra" class="badge badge--blue">+{{ a.extra }}h</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td><span class="badge" :class="`badge--${a.statusClass}`">{{ a.status }}</span></td>
            </tr>
            <tr v-if="asistencias.length === 0">
              <td colspan="7" class="empty-row">Sin registros de asistencia aún.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: INCAPACIDADES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'incapacidades'">
      <div class="vac-summary">
        <div class="vac-saldo">
          <span class="vac-num">{{ incapacidadesStats.total }}</span>
          <span class="vac-lbl">Registros totales</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ incapacidadesStats.diasAcumulados }}</span>
          <span class="vac-lbl">Días acumulados</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">{{ incapacidadesStats.activas }}</span>
          <span class="vac-lbl">Activas</span>
        </div>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportExcel(incapacidadesFiltradas,[{key:'numeroRegistro',label:'N° Registro'},{key:'name',label:'Colaborador'},{key:'tipoIncapacidad',label:'Tipo'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'status',label:'Estado'}],'incapacidades')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF(incapacidadesFiltradas,[{key:'numeroRegistro',label:'N° Registro'},{key:'name',label:'Colaborador'},{key:'tipoIncapacidad',label:'Tipo'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'status',label:'Estado'}],'Incapacidades')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary vac-btn" @click="abrirNuevaIncapacidad">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar incapacidad
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="incFiltroNumero" type="search" placeholder="N° de registro..." class="search-input" />
        </div>
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="incFiltroNombre" type="search" placeholder="Nombre del colaborador..." class="search-input" />
        </div>
        <div class="filter-date"><DatePicker v-model="incFiltroFecha" placeholder="Fecha" /></div>
        <select v-model="incFiltroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Registrada">Registrada</option>
          <option value="Activa">Activa</option>
          <option value="Finalizada">Finalizada</option>
          <option value="Anulada">Anulada</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Registro</th>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in incapacidadesFiltradas" :key="inc.id">
              <td>{{ inc.numeroRegistro }}</td>
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: inc.color }">{{ inc.initials }}</div>
                  <span>{{ inc.name }}</span>
                </div>
              </td>
              <td><span class="badge badge--blue">{{ inc.tipoIncapacidad || '—' }}</span></td>
              <td>{{ inc.inicio }}</td>
              <td>{{ inc.fin }}</td>
              <td>{{ inc.dias }}</td>
              <td><span class="badge" :class="`badge--${inc.statusClass}`">{{ inc.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver / editar registro" @click="abrirRevisarIncapacidad(inc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn action-btn--red" title="Eliminar" @click="confirmarEliminarIncapacidad(inc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
                <button class="action-btn" title="Descargar boleta" @click="exportarBoletaIncapacidad(inc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="incapacidadesFiltradas.length === 0">
              <td colspan="8" class="empty-row">Sin incapacidades registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: CAPACITACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'capacitaciones'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Capacitaciones</h3>
          <p class="section-desc">Gestión del plan de capacitación y registro de participación</p>
        </div>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportExcel(capacitaciones,[{key:'tema',label:'Tema'},{key:'modalidad',label:'Modalidad'},{key:'fecha',label:'Fecha'},{key:'instructor',label:'Instructor'},{key:'asistentes',label:'Asistentes'}],'capacitaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF(capacitaciones,[{key:'tema',label:'Tema'},{key:'modalidad',label:'Modalidad'},{key:'fecha',label:'Fecha'},{key:'instructor',label:'Instructor'},{key:'asistentes',label:'Asistentes'}],'Capacitaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('capacitacion')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva capacitación
          </button>
        </div>
      </div>

      <div class="cap-summary">
        <div class="cap-stat">
          <span class="cap-num">{{ capacitacionesStats.finalizadas }}</span>
          <span class="cap-lbl">Total realizadas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--blue">{{ capacitacionesStats.programadas }}</span>
          <span class="cap-lbl">Programadas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--green">{{ capacitacionesStats.horas }}</span>
          <span class="cap-lbl">Horas acumuladas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--teal">{{ capacitacionesStats.asistentes }}</span>
          <span class="cap-lbl">Asistentes totales</span>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Buscar por tema o instructor..." class="search-input" />
        </div>
        <select class="filter-select">
          <option value="">Todas las categorías</option>
          <option>Tecnología</option>
          <option>Finanzas</option>
          <option>Liderazgo</option>
          <option>Normativa</option>
          <option>Otro</option>
        </select>
        <select class="filter-select">
          <option value="">Todos los estados</option>
          <option>Programada</option>
          <option>En curso</option>
          <option>Finalizada</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tema / Nombre</th>
              <th>Categoría</th>
              <th>Modalidad</th>
              <th>Fecha</th>
              <th>Duración</th>
              <th>Instructor</th>
              <th>Asistentes</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cap in capacitaciones" :key="cap.id">
              <td>
                <div class="cap-nombre">
                  <span class="cap-titulo">{{ cap.nombre }}</span>
                  <span class="cap-depto">{{ cap.depto }}</span>
                </div>
              </td>
              <td><span class="badge badge--blue">{{ cap.categoria }}</span></td>
              <td>
                <span class="modalidad-badge" :class="`modalidad--${cap.modalidadClass}`">{{ cap.modalidad }}</span>
              </td>
              <td>{{ cap.fecha }}</td>
              <td>{{ cap.horas }}h</td>
              <td>{{ cap.instructor }}</td>
              <td>
                <div class="asistentes-cell">
                  <span class="asistentes-num">{{ cap.asistentes }}</span>
                  <span class="asistentes-lbl">personas</span>
                </div>
              </td>
              <td><span class="badge" :class="`badge--${cap.statusClass}`">{{ cap.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: EVALUACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'evaluaciones'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Evaluación de desempeño</h3>
          <p class="section-desc">Evaluaciones periódicas por competencias y objetivos</p>
        </div>
      </div>

      <div class="exp-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <p>Sin evaluaciones registradas. El módulo de evaluación de desempeño estará disponible próximamente.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         MODAL
    ══════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-backdrop" @click.self="modal.open = false">
        <div class="modal-box" :class="{ 'modal-box--expediente': modal.type === 'nuevo' || modal.type === 'editar' }">
          <button class="modal-close" @click="modal.open = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Nuevo / Editar colaborador: expediente en pestañas -->
          <template v-if="modal.type === 'nuevo' || modal.type === 'editar'">
            <h3 class="modal-title">{{ modal.type === 'nuevo' ? 'Agregar colaborador' : 'Editar colaborador' }}</h3>
            <p class="modal-subtitle">{{ modal.data ? nombreCompleto(modal.data) : 'Expediente del colaborador' }}</p>

            <div class="exp-modal-layout">
              <div class="exp-tab-list">
                <button
                  v-for="t in EXPEDIENTE_TABS" :key="t.key" type="button"
                  class="exp-tab-item"
                  :class="{ 'exp-tab-item--active': expedienteTab === t.key, 'exp-tab-item--disabled': t.requiresSaved && !modal.data?.id }"
                  @click="selectExpedienteTab(t)"
                >{{ t.label }}</button>
              </div>

              <div class="exp-tab-content">
                <div v-if="expedienteTabLocked" class="exp-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <p>Guarda primero la información personal y laboral para habilitar esta sección.</p>
                </div>

                <!-- Información personal -->
                <form v-else-if="expedienteTab === 'personal'" class="modal-form" @submit.prevent="guardarEmpleado">
                  <div class="form-row">
                    <div class="form-field"><label>Nombre(s) <span class="req">*</span></label><input v-model="empForm.nombre" type="text" placeholder="Ana" required /></div>
                    <div class="form-field"><label>Primer apellido</label><input v-model="empForm.primerApellido" type="text" placeholder="Vargas" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Segundo apellido</label><input v-model="empForm.segundoApellido" type="text" placeholder="Mora" /></div>
                    <div class="form-field"><label>Tipo de identificación</label>
                      <select v-model="empForm.tipoIdentificacion"><option>Cédula nacional</option><option>DIMEX</option><option>Pasaporte</option><option>Otro</option></select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Identificación <span class="req">*</span></label><input v-model="empForm.identificacion" type="text" placeholder="1-2345-6789" required /></div>
                    <div class="form-field"><label>Fecha de nacimiento</label><DatePicker v-model="empForm.fechaNacimiento" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Nacionalidad</label><input v-model="empForm.nacionalidad" type="text" placeholder="Costarricense" /></div>
                    <div class="form-field"><label>Sexo</label>
                      <select v-model="empForm.genero"><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
                    </div>
                  </div>
                  <div class="form-field"><label>Estado civil</label>
                    <select v-model="empForm.estadoCivil"><option value="">Seleccionar</option><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option><option>Unión libre</option></select>
                  </div>

                  <div class="form-section-title" style="margin-top:8px">Contacto</div>
                  <div class="form-row">
                    <div class="form-field"><label>Teléfono principal</label><input v-model="empForm.telefono" type="tel" placeholder="8888-9999" /></div>
                    <div class="form-field"><label>Teléfono secundario</label><input v-model="empForm.telefonoSecundario" type="tel" placeholder="8888-9999" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Correo personal</label><input v-model="empForm.correoPersonal" type="email" placeholder="ana@correo.com" /></div>
                    <div class="form-field"><label>Correo institucional</label><input v-model="empForm.correoInstitucional" type="email" placeholder="ana@cooperativa.com" /></div>
                  </div>

                  <div class="form-section-title" style="margin-top:8px">Dirección</div>
                  <div class="form-row">
                    <div class="form-field"><label>Provincia</label><input v-model="empForm.provincia" type="text" placeholder="San José" /></div>
                    <div class="form-field"><label>Cantón</label><input v-model="empForm.canton" type="text" placeholder="Central" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Distrito</label><input v-model="empForm.distrito" type="text" placeholder="Carmen" /></div>
                    <div class="form-field"><label>Dirección exacta</label><input v-model="empForm.direccionExacta" type="text" placeholder="100m norte de..." /></div>
                  </div>

                  <div v-if="empFormError" class="req" style="font-size:12.5px;">{{ empFormError }}</div>
                  <div class="modal-actions">
                    <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                    <button type="submit" class="btn-primary" :disabled="empFormSaving">Guardar información personal</button>
                  </div>
                </form>

                <!-- Información laboral -->
                <form v-else-if="expedienteTab === 'laboral'" class="modal-form" @submit.prevent="guardarEmpleado">
                  <div class="form-row">
                    <div class="form-field">
                      <label>Puesto <span class="req">*</span></label>
                      <input v-model="empForm.puesto" type="text" list="cargo-options" placeholder="Gerente, Contador..." required />
                      <datalist id="cargo-options"><option v-for="c in cargos" :key="c.id" :value="c.nombre" /></datalist>
                    </div>
                    <div class="form-field">
                      <label>Departamento <span class="req">*</span></label>
                      <input v-model="empForm.departamento" type="text" list="depto-options" placeholder="Administración, Créditos..." required />
                      <datalist id="depto-options"><option v-for="d in departamentos" :key="d.id" :value="d.nombre" /></datalist>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Código interno</label><input v-model="empForm.codigoInterno" type="text" placeholder="EMP-001" /></div>
                    <div class="form-field"><label>Jefatura inmediata</label>
                      <select v-model="empForm.jefeInmediatoId"><option value="">Sin jefatura</option><option v-for="j in jefeOptions" :key="j.id" :value="j.id">{{ j.name }}</option></select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Sede</label>
                      <select v-model="empForm.sedeId"><option value="">Seleccionar</option><option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option></select>
                    </div>
                    <div class="form-field"><label>Fecha de ingreso</label><DatePicker v-model="empForm.fechaIngreso" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Tipo de contratación</label>
                      <select v-model="empForm.tipoContrato"><option>Tiempo completo</option><option>Tiempo parcial</option><option>Por servicios</option></select>
                    </div>
                    <div class="form-field"><label>Jornada laboral</label>
                      <select v-model="empForm.jornadaId"><option value="">Seleccionar</option><option v-for="j in jornadas" :key="j.id" :value="j.id">{{ j.nombre }}</option></select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Horario</label>
                      <select v-model="empForm.horarioId"><option value="">Seleccionar</option><option v-for="h in horarios" :key="h.id" :value="h.id">{{ h.nombre }}</option></select>
                    </div>
                    <div class="form-field"><label>Estado</label>
                      <select v-model="empForm.activo"><option value="true">Activo</option><option value="false">Inactivo</option></select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Salario base (₡)</label><input v-model="empForm.salario" type="number" placeholder="500000" /></div>
                    <div class="form-field"><label>Moneda</label>
                      <select v-model="empForm.moneda"><option>CRC</option><option>USD</option></select>
                    </div>
                  </div>
                  <div class="form-field"><label>Forma de pago</label>
                    <select v-model="empForm.formaPago"><option value="">Seleccionar</option><option>Depósito bancario</option><option>Efectivo</option><option>Cheque</option></select>
                  </div>

                  <div v-if="empFormError" class="req" style="font-size:12.5px;">{{ empFormError }}</div>
                  <div class="modal-actions">
                    <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                    <button type="submit" class="btn-primary" :disabled="empFormSaving">Guardar información laboral</button>
                  </div>
                </form>

                <!-- Contactos de emergencia -->
                <div v-else-if="expedienteTab === 'contactos'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!contactos.length" class="exp-mini-empty">Sin contactos registrados</li>
                    <li v-for="c in contactos" :key="c.id" class="exp-mini-item">
                      <div>
                        <strong>{{ c.nombre_completo }}</strong> <span v-if="c.es_principal" class="badge badge--green">Principal</span>
                        <div class="exp-mini-sub">{{ c.parentesco }} · {{ c.telefono_principal }}<span v-if="c.telefono_secundario"> / {{ c.telefono_secundario }}</span></div>
                      </div>
                      <button type="button" class="action-btn" title="Quitar" @click="quitarContacto(c.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  </ul>
                  <div class="form-section-title">Agregar contacto</div>
                  <div class="form-row">
                    <div class="form-field"><label>Nombre completo <span class="req">*</span></label><input v-model="nuevoContacto.nombre_completo" type="text" /></div>
                    <div class="form-field"><label>Parentesco</label><input v-model="nuevoContacto.parentesco" type="text" placeholder="Padre, Madre, Cónyuge..." /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Teléfono principal</label><input v-model="nuevoContacto.telefono_principal" type="tel" /></div>
                    <div class="form-field"><label>Teléfono secundario</label><input v-model="nuevoContacto.telefono_secundario" type="tel" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Correo</label><input v-model="nuevoContacto.correo" type="email" /></div>
                    <div class="form-field checkbox-inline"><label><input v-model="nuevoContacto.es_principal" type="checkbox" /> Contacto principal</label></div>
                  </div>
                  <div class="form-field"><label>Observaciones</label><textarea v-model="nuevoContacto.observaciones" rows="2"></textarea></div>
                  <div v-if="contactoError" class="req" style="font-size:12.5px;">{{ contactoError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarContacto">Agregar contacto</button></div>
                </div>

                <!-- Contratos -->
                <div v-else-if="expedienteTab === 'contratos'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!contratos.length" class="exp-mini-empty">Sin contratos registrados</li>
                    <li v-for="c in contratos" :key="c.id" class="exp-mini-item">
                      <div>
                        <strong>{{ c.numero_contrato || 'Sin número' }}</strong> <span class="badge badge--blue">{{ c.estado_contrato }}</span>
                        <div class="exp-mini-sub">Desde {{ c.fecha_inicio }}<span v-if="c.fecha_fin"> hasta {{ c.fecha_fin }}</span> · ₡{{ c.salario_pactado || 0 }}</div>
                      </div>
                    </li>
                  </ul>
                  <div class="form-section-title">Registrar contrato</div>
                  <div class="form-row">
                    <div class="form-field"><label>Tipo de contratación</label>
                      <select v-model="nuevoContrato.tipo_contrato_id"><option value="">Seleccionar</option><option v-for="t in tiposContratacion" :key="t.id" :value="t.id">{{ t.nombre }}</option></select>
                    </div>
                    <div class="form-field"><label>Número de contrato</label><input v-model="nuevoContrato.numero_contrato" type="text" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha de inicio <span class="req">*</span></label><DatePicker v-model="nuevoContrato.fecha_inicio" /></div>
                    <div class="form-field"><label>Fecha de finalización</label><DatePicker v-model="nuevoContrato.fecha_fin" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Salario pactado (₡)</label><input v-model="nuevoContrato.salario_pactado" type="number" /></div>
                    <div class="form-field"><label>Estado del contrato</label>
                      <select v-model="nuevoContrato.estado_contrato"><option value="vigente">Vigente</option><option value="finalizado">Finalizado</option><option value="rescindido">Rescindido</option></select>
                    </div>
                  </div>
                  <div class="form-field checkbox-inline"><label><input v-model="nuevoContrato.periodo_prueba" type="checkbox" /> En período de prueba</label></div>
                  <div class="form-field"><label>Observaciones</label><textarea v-model="nuevoContrato.observaciones" rows="2"></textarea></div>
                  <div v-if="contratoError" class="req" style="font-size:12.5px;">{{ contratoError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarContrato">Registrar contrato</button></div>
                  <p class="exp-hint">El historial de contratos no se sobrescribe: cada cambio queda como un registro nuevo.</p>
                </div>

                <!-- Formación académica -->
                <div v-else-if="expedienteTab === 'academica'" class="exp-subsection">
                  <h4 class="exp-subtitle">Formación académica</h4>
                  <ul class="exp-mini-list">
                    <li v-if="!formacionAcademica.length" class="exp-mini-empty">Sin estudios registrados</li>
                    <li v-for="f in formacionAcademica" :key="f.id" class="exp-mini-item">
                      <div>
                        <strong>{{ f.titulo_obtenido || f.nivel_academico }}</strong>
                        <div class="exp-mini-sub">{{ f.nivel_academico }}<span v-if="f.profesion"> · {{ f.profesion }}</span><span v-if="f.fecha_graduacion"> · {{ f.fecha_graduacion }}</span></div>
                      </div>
                      <button type="button" class="action-btn" title="Quitar" @click="quitarFormacionAcademica(f.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  </ul>
                  <div class="form-row">
                    <div class="form-field"><label>Nivel académico</label>
                      <select v-model="nuevaFormacion.nivel_academico"><option value="">Seleccionar</option><option v-for="n in NIVELES_ACADEMICOS" :key="n">{{ n }}</option></select>
                    </div>
                    <div class="form-field">
                      <label>Institución educativa</label>
                      <input v-model="nuevaFormacion.institucionEducativa" type="text" list="institucion-options" placeholder="Universidad de Costa Rica..." />
                      <datalist id="institucion-options"><option v-for="i in institucionesEducativas" :key="i.id" :value="i.nombre" /></datalist>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Profesión</label><input v-model="nuevaFormacion.profesion" type="text" /></div>
                    <div class="form-field"><label>Especialidad</label><input v-model="nuevaFormacion.especialidad" type="text" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Título obtenido</label><input v-model="nuevaFormacion.titulo_obtenido" type="text" /></div>
                    <div class="form-field"><label>Fecha de graduación</label><DatePicker v-model="nuevaFormacion.fecha_graduacion" /></div>
                  </div>
                  <div v-if="formacionError" class="req" style="font-size:12.5px;">{{ formacionError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarFormacionAcademica">Agregar estudio</button></div>

                  <h4 class="exp-subtitle" style="margin-top:18px">Colegiatura profesional</h4>
                  <ul class="exp-mini-list">
                    <li v-if="!colegiaturas.length" class="exp-mini-empty">Sin colegiaturas registradas</li>
                    <li v-for="c in colegiaturas" :key="c.id" class="exp-mini-item">
                      <div>
                        <strong>N° {{ c.numero_colegiado || '—' }}</strong> <span class="badge badge--blue">{{ c.estado }}</span>
                        <div class="exp-mini-sub" v-if="c.fecha_vencimiento">Vence {{ c.fecha_vencimiento }}</div>
                      </div>
                      <button type="button" class="action-btn" title="Quitar" @click="quitarColegiatura(c.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  </ul>
                  <div class="form-row">
                    <div class="form-field">
                      <label>Colegio profesional</label>
                      <input v-model="nuevaColegiatura.colegioProfesional" type="text" list="colegio-options" placeholder="Colegio de Contadores..." />
                      <datalist id="colegio-options"><option v-for="c in colegiosProfesionales" :key="c.id" :value="c.nombre" /></datalist>
                    </div>
                    <div class="form-field"><label>Número de colegiado</label><input v-model="nuevaColegiatura.numero_colegiado" type="text" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha de incorporación</label><DatePicker v-model="nuevaColegiatura.fecha_incorporacion" /></div>
                    <div class="form-field"><label>Fecha de vencimiento</label><DatePicker v-model="nuevaColegiatura.fecha_vencimiento" /></div>
                  </div>
                  <div v-if="colegiaturaError" class="req" style="font-size:12.5px;">{{ colegiaturaError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarColegiatura">Agregar colegiatura</button></div>
                </div>

                <!-- Certificaciones y cursos -->
                <div v-else-if="expedienteTab === 'certificaciones'" class="exp-subsection">
                  <h4 class="exp-subtitle">Certificaciones</h4>
                  <ul class="exp-mini-list">
                    <li v-if="!certificacionesProfesionales.length" class="exp-mini-empty">Sin certificaciones registradas</li>
                    <li v-for="c in certificacionesProfesionales" :key="c.id" class="exp-mini-item">
                      <div>
                        <strong>{{ c.nombre }}</strong> <span class="badge badge--blue">{{ c.estado }}</span>
                        <div class="exp-mini-sub">{{ c.institucion_certificadora }}<span v-if="c.fecha_vencimiento"> · Vence {{ c.fecha_vencimiento }}</span></div>
                      </div>
                      <button type="button" class="action-btn" title="Quitar" @click="quitarCertificacion(c.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  </ul>
                  <div class="form-row">
                    <div class="form-field"><label>Nombre de certificación</label><input v-model="nuevaCertificacion.nombre" type="text" /></div>
                    <div class="form-field"><label>Institución certificadora</label><input v-model="nuevaCertificacion.institucion_certificadora" type="text" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha de emisión</label><DatePicker v-model="nuevaCertificacion.fecha_emision" /></div>
                    <div class="form-field"><label>Fecha de vencimiento</label><DatePicker v-model="nuevaCertificacion.fecha_vencimiento" /></div>
                  </div>
                  <div v-if="certificacionError" class="req" style="font-size:12.5px;">{{ certificacionError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarCertificacion">Agregar certificación</button></div>

                  <h4 class="exp-subtitle" style="margin-top:18px">Cursos y capacitaciones externas</h4>
                  <ul class="exp-mini-list">
                    <li v-if="!cursosColaborador.length" class="exp-mini-empty">Sin cursos registrados</li>
                    <li v-for="c in cursosColaborador" :key="c.id" class="exp-mini-item">
                      <div>
                        <strong>{{ c.nombre_curso }}</strong>
                        <div class="exp-mini-sub">{{ c.institucion }}<span v-if="c.duracion_horas"> · {{ c.duracion_horas }}h</span> · {{ c.modalidad }}</div>
                      </div>
                      <button type="button" class="action-btn" title="Quitar" @click="quitarCurso(c.id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </li>
                  </ul>
                  <div class="form-row">
                    <div class="form-field"><label>Nombre del curso</label><input v-model="nuevoCurso.nombre_curso" type="text" /></div>
                    <div class="form-field"><label>Institución</label><input v-model="nuevoCurso.institucion" type="text" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha</label><DatePicker v-model="nuevoCurso.fecha" /></div>
                    <div class="form-field"><label>Duración (horas)</label><input v-model="nuevoCurso.duracion_horas" type="number" /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Modalidad</label>
                      <select v-model="nuevoCurso.modalidad"><option>Presencial</option><option>Virtual</option><option>Mixta</option></select>
                    </div>
                    <div class="form-field checkbox-inline"><label><input v-model="nuevoCurso.tiene_certificado" type="checkbox" /> Tiene certificado</label></div>
                  </div>
                  <div v-if="cursoError" class="req" style="font-size:12.5px;">{{ cursoError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarCurso">Agregar curso</button></div>
                </div>

                <!-- Información bancaria -->
                <div v-else-if="expedienteTab === 'bancaria'" class="exp-subsection">
                  <p v-if="bancariosSinAcceso" class="exp-hint">No tienes acceso a esta información. Solo el administrador puede ver y editar datos bancarios.</p>
                  <template v-else>
                    <div class="form-row">
                      <div class="form-field"><label>Banco</label><input v-model="bancariosForm.banco" type="text" /></div>
                      <div class="form-field"><label>Tipo de cuenta</label>
                        <select v-model="bancariosForm.tipo_cuenta"><option value="">Seleccionar</option><option>Ahorro</option><option>Corriente</option></select>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field"><label>Número de cuenta</label><input v-model="bancariosForm.numero_cuenta" type="text" /></div>
                      <div class="form-field"><label>IBAN</label><input v-model="bancariosForm.iban" type="text" placeholder="CR..." /></div>
                    </div>
                    <div class="form-row">
                      <div class="form-field"><label>Moneda</label>
                        <select v-model="bancariosForm.moneda"><option>CRC</option><option>USD</option></select>
                      </div>
                      <div class="form-field"><label>Estado</label>
                        <select v-model="bancariosForm.estado"><option value="activa">Activa</option><option value="inactiva">Inactiva</option></select>
                      </div>
                    </div>
                    <div v-if="bancariosError" class="req" style="font-size:12.5px;">{{ bancariosError }}</div>
                    <div class="modal-actions"><button type="button" class="btn-primary" :disabled="bancariosSaving" @click="guardarBancarios">Guardar información bancaria</button></div>
                  </template>
                </div>

                <!-- Pendientes para la fase 3 -->
                <!-- Documentos -->
                <div v-else-if="expedienteTab === 'documentos'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!documentos.length" class="exp-mini-empty">Sin documentos registrados</li>
                    <li v-for="d in documentos" :key="d.id" class="exp-mini-item">
                      <div>
                        <strong>{{ d.nombre }}</strong>
                        <span class="badge" :class="`badge--${vencimientoInfo(d.fecha_vencimiento).color}`">{{ vencimientoInfo(d.fecha_vencimiento).label }}</span>
                        <div class="exp-mini-sub">{{ d.catalogos_personal?.nombre || 'Sin tipo' }}<span v-if="d.fecha_vencimiento"> · Vence {{ d.fecha_vencimiento }}</span></div>
                      </div>
                      <div style="display:flex; gap:4px;">
                        <button type="button" class="action-btn" title="Descargar" @click="descargarDocumento(d)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        <button type="button" class="action-btn" title="Eliminar" @click="quitarDocumento(d)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </li>
                  </ul>
                  <div class="form-section-title">Subir documento</div>
                  <div class="form-row">
                    <div class="form-field"><label>Tipo de documento</label>
                      <select v-model="nuevoDocumento.tipoDocumentoId"><option value="">Seleccionar</option><option v-for="t in tiposDocumento" :key="t.id" :value="t.id">{{ t.nombre }}</option></select>
                    </div>
                    <div class="form-field"><label>Nombre</label><input v-model="nuevoDocumento.nombre" type="text" placeholder="Cédula, currículum..." /></div>
                  </div>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha de emisión</label><DatePicker v-model="nuevoDocumento.fechaEmision" /></div>
                    <div class="form-field"><label>Fecha de vencimiento</label><DatePicker v-model="nuevoDocumento.fechaVencimiento" /></div>
                  </div>
                  <div class="form-field"><label>Archivo <span class="req">*</span></label><input type="file" @change="onDocumentoFileChange" /></div>
                  <div class="form-field"><label>Observaciones</label><textarea v-model="nuevoDocumento.observaciones" rows="2"></textarea></div>
                  <div v-if="documentoError" class="req" style="font-size:12.5px;">{{ documentoError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" :disabled="documentoSubiendo" @click="subirNuevoDocumento">{{ documentoSubiendo ? 'Subiendo...' : 'Subir documento' }}</button></div>
                </div>

                <!-- Historial laboral -->
                <div v-else-if="expedienteTab === 'historial'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!movimientos.length" class="exp-mini-empty">Sin movimientos registrados</li>
                    <li v-for="m in movimientos" :key="m.id" class="exp-mini-item">
                      <div>
                        <strong>{{ m.tipo?.nombre || 'Movimiento' }}</strong>
                        <div class="exp-mini-sub">
                          {{ m.fecha }}
                          <span v-if="m.puestoAnterior?.nombre || m.puestoNuevo?.nombre"> · {{ m.puestoAnterior?.nombre || '—' }} → {{ m.puestoNuevo?.nombre || '—' }}</span>
                          <span v-if="m.salario_anterior || m.salario_nuevo"> · ₡{{ m.salario_anterior || 0 }} → ₡{{ m.salario_nuevo || 0 }}</span>
                          <span v-if="m.motivo"> · {{ m.motivo }}</span>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <p class="exp-hint">Los cambios de puesto, departamento y salario quedan registrados automáticamente al editar la información laboral. Este historial no se puede editar ni eliminar.</p>
                  <div class="form-section-title">Registrar otro movimiento</div>
                  <div class="form-row">
                    <div class="form-field">
                      <label>Tipo de movimiento</label>
                      <input v-model="nuevoMovimiento.tipoMovimiento" type="text" list="tipo-movimiento-options" placeholder="Traslado, Permiso, Suspensión..." />
                      <datalist id="tipo-movimiento-options"><option v-for="t in tiposMovimiento" :key="t.id" :value="t.nombre" /></datalist>
                    </div>
                    <div class="form-field"><label>Fecha</label><DatePicker v-model="nuevoMovimiento.fecha" /></div>
                  </div>
                  <div class="form-field"><label>Motivo</label><textarea v-model="nuevoMovimiento.motivo" rows="2"></textarea></div>
                  <div v-if="movimientoError" class="req" style="font-size:12.5px;">{{ movimientoError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" @click="agregarMovimiento">Registrar movimiento</button></div>
                </div>

                <!-- Salida -->
                <div v-else-if="expedienteTab === 'salida'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!salidas.length" class="exp-mini-empty">El colaborador no tiene salidas registradas</li>
                    <li v-for="s in salidas" :key="s.id" class="exp-mini-item">
                      <div><strong>{{ s.fecha_salida }}</strong><div class="exp-mini-sub">{{ s.motivo }}</div></div>
                    </li>
                  </ul>
                  <div class="form-section-title">Registrar salida</div>
                  <p class="exp-hint">Al registrar una salida, el colaborador pasa automáticamente a estado Inactivo. Su expediente permanece disponible para consulta.</p>
                  <div class="form-row">
                    <div class="form-field"><label>Fecha de salida <span class="req">*</span></label><DatePicker v-model="salidaFecha" /></div>
                    <div class="form-field">
                      <label>Tipo de salida <span class="req">*</span></label>
                      <input v-model="nuevaSalida.tipoSalida" type="text" list="tipo-salida-options" placeholder="Renuncia, Despido, Jubilación..." />
                      <datalist id="tipo-salida-options"><option v-for="t in tiposSalida" :key="t.id" :value="t.nombre" /></datalist>
                    </div>
                  </div>
                  <div class="form-field"><label>Motivo</label><textarea v-model="nuevaSalida.motivo" rows="2"></textarea></div>
                  <div class="form-field"><label>Observaciones</label><textarea v-model="nuevaSalida.observaciones" rows="2"></textarea></div>
                  <div v-if="salidaError" class="req" style="font-size:12.5px;">{{ salidaError }}</div>
                  <div class="modal-actions"><button type="button" class="btn-primary" :disabled="salidaSaving" @click="registrarSalidaColaborador">Registrar salida</button></div>
                </div>

                <!-- Auditoría -->
                <div v-else-if="expedienteTab === 'auditoria'" class="exp-subsection">
                  <ul class="exp-mini-list">
                    <li v-if="!auditoria.length" class="exp-mini-empty">Sin registros de auditoría todavía</li>
                    <li v-for="a in auditoria" :key="a.id" class="exp-mini-item">
                      <div>
                        <strong>{{ a.accion === 'crear' ? 'Expediente creado' : 'Expediente actualizado' }}</strong>
                        <div class="exp-mini-sub">{{ a.profiles?.full_name || 'Usuario' }} · {{ new Date(a.created_at).toLocaleString('es-CR') }}</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>

          <!-- Confirmar eliminación de colaborador -->
          <template v-if="modal.type === 'eliminar'">
            <h3 class="modal-title">Eliminar colaborador</h3>
            <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            <p style="font-size:13.5px; color:#4A6070; margin-bottom:18px;">
              ¿Seguro que deseas eliminar a <strong>{{ modal.data ? nombreCompleto(modal.data) : '' }}</strong>? Se eliminará también todo su expediente:
              contactos, contratos, formación académica, certificaciones, documentos e historial laboral.
            </p>
            <div v-if="eliminarEmpleadoError" class="req" style="font-size:12.5px; margin-bottom:10px;">{{ eliminarEmpleadoError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoEmpleado" @click="eliminarEmpleadoConfirmado">
                {{ eliminandoEmpleado ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Confirmar eliminación de solicitud de vacaciones -->
          <template v-if="modal.type === 'eliminar-vacacion'">
            <h3 class="modal-title">Eliminar solicitud</h3>
            <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            <p style="font-size:13.5px; color:#4A6070; margin-bottom:18px;">
              ¿Seguro que deseas eliminar la solicitud <strong>{{ modal.data?.numeroSolicitud }}</strong> de <strong>{{ modal.data?.name }}</strong>?
            </p>
            <div v-if="eliminarVacacionError" class="req" style="font-size:12.5px; margin-bottom:10px;">{{ eliminarVacacionError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoVacacion" @click="eliminarVacacionConfirmada">
                {{ eliminandoVacacion ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Solicitud de vacaciones (en pestañas: Solicitud / Aprobación) -->
          <template v-if="modal.type === 'vacacion'">
            <h3 class="modal-title">Solicitud de vacaciones</h3>
            <p class="modal-subtitle">{{ modal.data ? modal.data.numeroSolicitud : 'Nueva solicitud' }}</p>

            <div class="vac-modal-tabs">
              <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': vacTab === 'solicitud' }" @click="vacTab = 'solicitud'">Solicitud</button>
              <button
                type="button" class="exp-tab-item"
                :class="{ 'exp-tab-item--active': vacTab === 'aprobacion', 'exp-tab-item--disabled': !modal.data }"
                @click="modal.data && (vacTab = 'aprobacion')"
              >Aprobación</button>
            </div>

            <!-- Tab: Solicitud -->
            <form v-if="vacTab === 'solicitud'" class="modal-form" @submit.prevent="enviarSolicitudVacacion">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select v-model="vacForm.empleadoId" :disabled="!!modal.data" required>
                  <option value="">Seleccionar</option>
                  <option v-for="e in employees" :key="e.id" :value="e.id">{{ nombreCompleto(e) }}</option>
                </select>
              </div>

              <div v-if="vacEmpleadoInfo" class="exp-grid" style="margin: 6px 0 4px;">
                <div class="exp-field"><label>Código</label><span>{{ vacEmpleadoInfo.codigo }}</span></div>
                <div class="exp-field"><label>Departamento</label><span>{{ vacEmpleadoInfo.departamento }}</span></div>
                <div class="exp-field"><label>Puesto</label><span>{{ vacEmpleadoInfo.puesto }}</span></div>
                <div class="exp-field"><label>Jefatura</label><span>{{ vacEmpleadoInfo.jefatura }}</span></div>
                <div class="exp-field"><label>Fecha de ingreso</label><span>{{ vacEmpleadoInfo.fechaIngreso }}</span></div>
                <div class="exp-field"><label>Días disponibles</label><span>{{ vacDiasDisponibles !== null ? vacDiasDisponibles + ' días' : '—' }}</span></div>
              </div>

              <div class="form-field">
                <label>Tipo de vacaciones</label>
                <select v-model="vacForm.tipoVacacionId" :disabled="!vacCamposEditables">
                  <option value="">Seleccionar</option>
                  <option v-for="t in tiposVacacion" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio <span class="req">*</span></label><DatePicker v-model="vacForm.fechaInicio" :disabled="!vacCamposEditables" /></div>
                <div class="form-field"><label>Fecha fin <span class="req">*</span></label><DatePicker v-model="vacForm.fechaFin" :disabled="!vacCamposEditables" /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Días solicitados</label><input :value="vacForm.diasSolicitados" type="text" disabled /></div>
                <div class="form-field"><label>Días hábiles</label><input :value="vacForm.diasHabiles" type="text" disabled /></div>
              </div>
              <div class="form-field"><label>Observaciones</label><textarea v-model="vacForm.observaciones" rows="3" placeholder="Motivo o notas adicionales..." :disabled="!vacCamposEditables"></textarea></div>

              <div class="form-field">
                <label>Documento adjunto</label>
                <div v-if="vacDocumentoActual" class="adjunto-actual">
                  <span class="adjunto-nombre" @click="verDocumentoVacacion">{{ vacDocumentoActual.nombre }}</span>
                  <button v-if="vacCamposEditables" type="button" class="adjunto-quitar" title="Quitar documento" @click="quitarDocumentoVacacion">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <input v-if="vacCamposEditables" type="file" @change="onVacArchivoChange" />
              </div>

              <div v-if="vacError" class="req" style="font-size:12.5px;">{{ vacError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                <button v-if="vacCamposEditables" type="submit" class="btn-primary" :disabled="vacSaving">
                  {{ vacSaving ? 'Guardando...' : (modal.data ? 'Guardar cambios' : 'Enviar solicitud') }}
                </button>
              </div>
            </form>

            <!-- Tab: Aprobación -->
            <div v-else-if="vacTab === 'aprobacion' && modal.data" class="exp-subsection">
              <div class="exp-grid">
                <div class="exp-field"><label>Estado</label><span class="badge" :class="`badge--${modal.data.statusClass}`">{{ modal.data.status }}</span></div>
                <div class="exp-field"><label>Fecha de solicitud</label><span>{{ modal.data.fechaSolicitud }}</span></div>
              </div>

              <template v-if="modal.data.estado === 'pendiente'">
                <div class="form-field"><label>Comentario (si apruebas, opcional)</label><textarea v-model="vacAprobacionComentario" rows="2"></textarea></div>
                <div class="form-field"><label>Motivo de rechazo <span class="req">*</span> (obligatorio si rechazas)</label><textarea v-model="vacAprobacionMotivo" rows="2"></textarea></div>
                <div v-if="vacError" class="req" style="font-size:12.5px;">{{ vacError }}</div>
                <div class="modal-actions">
                  <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                  <button type="button" class="btn-primary btn-primary--danger" :disabled="vacResolviendo" @click="rechazarVacacion">Rechazar</button>
                  <button type="button" class="btn-primary" :disabled="vacResolviendo" @click="aprobarVacacion">Aprobar</button>
                </div>
              </template>
              <template v-else>
                <div class="exp-grid">
                  <div class="exp-field"><label>Resuelto por</label><span>{{ modal.data.aprobadoPor || '—' }}</span></div>
                  <div class="exp-field"><label>Fecha de resolución</label><span>{{ modal.data.fechaAprobacion ? new Date(modal.data.fechaAprobacion).toLocaleString('es-CR') : '—' }}</span></div>
                  <div v-if="modal.data.comentarioAprobacion" class="exp-field exp-field--full"><label>Comentario</label><span>{{ modal.data.comentarioAprobacion }}</span></div>
                  <div v-if="modal.data.motivoRechazo" class="exp-field exp-field--full"><label>Motivo de rechazo</label><span>{{ modal.data.motivoRechazo }}</span></div>
                </div>
                <div class="modal-actions"><button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button></div>
              </template>
            </div>
          </template>

          <!-- Confirmar eliminación de solicitud de permiso -->
          <template v-if="modal.type === 'eliminar-permiso'">
            <h3 class="modal-title">Eliminar solicitud</h3>
            <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            <p style="font-size:13.5px; color:#4A6070; margin-bottom:18px;">
              ¿Seguro que deseas eliminar la solicitud <strong>{{ modal.data?.numeroSolicitud }}</strong> de <strong>{{ modal.data?.name }}</strong>?
            </p>
            <div v-if="eliminarPermisoError" class="req" style="font-size:12.5px; margin-bottom:10px;">{{ eliminarPermisoError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoPermiso" @click="eliminarPermisoConfirmada">
                {{ eliminandoPermiso ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Solicitud de permiso (en pestañas: Solicitud / Aprobación) -->
          <template v-if="modal.type === 'permiso'">
            <h3 class="modal-title">Solicitud de permiso</h3>
            <p class="modal-subtitle">{{ modal.data ? modal.data.numeroSolicitud : 'Nueva solicitud' }}</p>

            <div class="vac-modal-tabs">
              <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': permTab === 'solicitud' }" @click="permTab = 'solicitud'">Solicitud</button>
              <button
                type="button" class="exp-tab-item"
                :class="{ 'exp-tab-item--active': permTab === 'aprobacion', 'exp-tab-item--disabled': !modal.data }"
                @click="modal.data && (permTab = 'aprobacion')"
              >Aprobación</button>
            </div>

            <!-- Tab: Solicitud -->
            <form v-if="permTab === 'solicitud'" class="modal-form" @submit.prevent="enviarSolicitudPermiso">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select v-model="permForm.empleadoId" :disabled="!!modal.data" required>
                  <option value="">Seleccionar</option>
                  <option v-for="e in employees" :key="e.id" :value="e.id">{{ nombreCompleto(e) }}</option>
                </select>
              </div>

              <div v-if="permEmpleadoInfo" class="exp-grid" style="margin: 6px 0 4px;">
                <div class="exp-field"><label>Código</label><span>{{ permEmpleadoInfo.codigo }}</span></div>
                <div class="exp-field"><label>Departamento</label><span>{{ permEmpleadoInfo.departamento }}</span></div>
                <div class="exp-field"><label>Puesto</label><span>{{ permEmpleadoInfo.puesto }}</span></div>
                <div class="exp-field"><label>Jefatura</label><span>{{ permEmpleadoInfo.jefatura }}</span></div>
                <div class="exp-field"><label>Fecha de ingreso</label><span>{{ permEmpleadoInfo.fechaIngreso }}</span></div>
              </div>

              <div class="form-field">
                <label>Tipo de permiso</label>
                <select v-model="permForm.tipoPermisoId" :disabled="!permCamposEditables">
                  <option value="">Seleccionar</option>
                  <option v-for="t in tiposPermiso" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio <span class="req">*</span></label><DatePicker v-model="permForm.fechaInicio" :disabled="!permCamposEditables" /></div>
                <div class="form-field"><label>Fecha fin <span class="req">*</span></label><DatePicker v-model="permForm.fechaFin" :disabled="!permCamposEditables" /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Hora inicio</label><TimePicker v-model="permForm.horaInicio" :disabled="!permCamposEditables" /></div>
                <div class="form-field"><label>Hora fin</label><TimePicker v-model="permForm.horaFin" :disabled="!permCamposEditables" /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Cantidad de días</label><input :value="permForm.cantidadDias" type="text" disabled /></div>
                <div class="form-field"><label>Cantidad de horas</label><input :value="permForm.cantidadHoras" type="text" disabled /></div>
              </div>
              <div class="form-field"><label>Motivo</label><textarea v-model="permForm.motivo" rows="2" placeholder="Descripción del motivo..." :disabled="!permCamposEditables"></textarea></div>
              <div class="form-field"><label>Observaciones</label><textarea v-model="permForm.observaciones" rows="2" :disabled="!permCamposEditables"></textarea></div>

              <div class="form-field">
                <label>Documento adjunto</label>
                <div v-if="permDocumentoActual" class="adjunto-actual">
                  <span class="adjunto-nombre" @click="verDocumentoPermiso">{{ permDocumentoActual.nombre }}</span>
                  <button v-if="permCamposEditables" type="button" class="adjunto-quitar" title="Quitar documento" @click="quitarDocumentoPermiso">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <input v-if="permCamposEditables" type="file" @change="onPermArchivoChange" />
              </div>

              <div v-if="permError" class="req" style="font-size:12.5px;">{{ permError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                <button v-if="permCamposEditables" type="submit" class="btn-primary" :disabled="permSaving">
                  {{ permSaving ? 'Guardando...' : (modal.data ? 'Guardar cambios' : 'Enviar solicitud') }}
                </button>
              </div>
            </form>

            <!-- Tab: Aprobación -->
            <div v-else-if="permTab === 'aprobacion' && modal.data" class="exp-subsection">
              <div class="exp-grid">
                <div class="exp-field"><label>Estado</label><span class="badge" :class="`badge--${modal.data.statusClass}`">{{ modal.data.status }}</span></div>
                <div class="exp-field"><label>Fecha de solicitud</label><span>{{ modal.data.fechaSolicitud }}</span></div>
              </div>

              <template v-if="modal.data.estado === 'pendiente'">
                <div class="form-field"><label>Comentario (si apruebas, opcional)</label><textarea v-model="permAprobacionComentario" rows="2"></textarea></div>
                <div class="form-field"><label>Motivo de rechazo <span class="req">*</span> (obligatorio si rechazas)</label><textarea v-model="permAprobacionMotivo" rows="2"></textarea></div>
                <div v-if="permError" class="req" style="font-size:12.5px;">{{ permError }}</div>
                <div class="modal-actions">
                  <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                  <button type="button" class="btn-primary btn-primary--danger" :disabled="permResolviendo" @click="rechazarPermiso">Rechazar</button>
                  <button type="button" class="btn-primary" :disabled="permResolviendo" @click="aprobarPermiso">Aprobar</button>
                </div>
              </template>
              <template v-else>
                <div class="exp-grid">
                  <div class="exp-field"><label>Resuelto por</label><span>{{ modal.data.aprobadoPor || '—' }}</span></div>
                  <div class="exp-field"><label>Fecha de resolución</label><span>{{ modal.data.fechaAprobacion ? new Date(modal.data.fechaAprobacion).toLocaleString('es-CR') : '—' }}</span></div>
                  <div v-if="modal.data.comentarioAprobacion" class="exp-field exp-field--full"><label>Comentario</label><span>{{ modal.data.comentarioAprobacion }}</span></div>
                  <div v-if="modal.data.motivoRechazo" class="exp-field exp-field--full"><label>Motivo de rechazo</label><span>{{ modal.data.motivoRechazo }}</span></div>
                </div>
                <div class="modal-actions"><button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button></div>
              </template>
            </div>
          </template>

          <!-- Confirmar eliminación de incapacidad -->
          <template v-if="modal.type === 'eliminar-incapacidad'">
            <h3 class="modal-title">Eliminar registro</h3>
            <p class="modal-subtitle">Esta acción no se puede deshacer</p>
            <p style="font-size:13.5px; color:#4A6070; margin-bottom:18px;">
              ¿Seguro que deseas eliminar el registro <strong>{{ modal.data?.numeroRegistro }}</strong> de <strong>{{ modal.data?.name }}</strong>?
            </p>
            <div v-if="eliminarIncapacidadError" class="req" style="font-size:12.5px; margin-bottom:10px;">{{ eliminarIncapacidadError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoIncapacidad" @click="eliminarIncapacidadConfirmada">
                {{ eliminandoIncapacidad ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Registro de incapacidad (en pestañas: Registro / Reincorporación) -->
          <template v-if="modal.type === 'incapacidad'">
            <h3 class="modal-title">Registro de incapacidad</h3>
            <p class="modal-subtitle">{{ modal.data ? modal.data.numeroRegistro : 'Nuevo registro' }}</p>

            <div class="vac-modal-tabs">
              <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': incTab === 'registro' }" @click="incTab = 'registro'">Registro</button>
              <button
                type="button" class="exp-tab-item"
                :class="{ 'exp-tab-item--active': incTab === 'reincorporacion', 'exp-tab-item--disabled': !modal.data }"
                @click="modal.data && (incTab = 'reincorporacion')"
              >Reincorporación</button>
            </div>

            <!-- Tab: Registro -->
            <form v-if="incTab === 'registro'" class="modal-form" @submit.prevent="enviarRegistroIncapacidad">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select v-model="incForm.empleadoId" :disabled="!!modal.data" required>
                  <option value="">Seleccionar</option>
                  <option v-for="e in employees" :key="e.id" :value="e.id">{{ nombreCompleto(e) }}</option>
                </select>
              </div>

              <div v-if="incEmpleadoInfo" class="exp-grid" style="margin: 6px 0 4px;">
                <div class="exp-field"><label>Código</label><span>{{ incEmpleadoInfo.codigo }}</span></div>
                <div class="exp-field"><label>Departamento</label><span>{{ incEmpleadoInfo.departamento }}</span></div>
                <div class="exp-field"><label>Puesto</label><span>{{ incEmpleadoInfo.puesto }}</span></div>
                <div class="exp-field"><label>Jefatura</label><span>{{ incEmpleadoInfo.jefatura }}</span></div>
                <div class="exp-field"><label>Fecha de ingreso</label><span>{{ incEmpleadoInfo.fechaIngreso }}</span></div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Tipo de incapacidad</label>
                  <select v-model="incForm.tipoIncapacidadId" :disabled="!incCamposEditables">
                    <option value="">Seleccionar</option>
                    <option v-for="t in tiposIncapacidad" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Institución emisora</label>
                  <select v-model="incForm.institucionEmisoraId" :disabled="!incCamposEditables">
                    <option value="">Seleccionar</option>
                    <option v-for="i in institucionesEmisoras" :key="i.id" :value="i.id">{{ i.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>N° de referencia</label><input v-model="incForm.numeroReferencia" type="text" placeholder="Número emitido por la institución" :disabled="!incCamposEditables" /></div>
                <div class="form-field"><label>Fecha de emisión</label><DatePicker v-model="incForm.fechaEmision" :disabled="!incCamposEditables" /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio <span class="req">*</span></label><DatePicker v-model="incForm.fechaInicio" :disabled="!incCamposEditables" /></div>
                <div class="form-field"><label>Fecha fin <span class="req">*</span></label><DatePicker v-model="incForm.fechaFin" :disabled="!incCamposEditables" /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Cantidad de días</label><input :value="incForm.cantidadDias" type="text" disabled /></div>
                <div class="form-field"><label>Reincorporación prevista</label><DatePicker v-model="incForm.fechaReincorporacionPrevista" :disabled="!incCamposEditables" /></div>
              </div>
              <div class="form-field"><label>Observaciones administrativas</label><textarea v-model="incForm.observaciones" rows="2" :disabled="!incCamposEditables"></textarea></div>

              <div class="form-field">
                <label>Documento adjunto</label>
                <div v-if="incDocumentoActual" class="adjunto-actual">
                  <span class="adjunto-nombre" @click="verDocumentoIncapacidad">{{ incDocumentoActual.nombre }}</span>
                  <button v-if="incCamposEditables" type="button" class="adjunto-quitar" title="Quitar documento" @click="quitarDocumentoIncapacidad">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <input v-if="incCamposEditables" type="file" @change="onIncArchivoChange" />
              </div>

              <div v-if="incError" class="req" style="font-size:12.5px;">{{ incError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                <button v-if="incCamposEditables" type="submit" class="btn-primary" :disabled="incSaving">
                  {{ incSaving ? 'Guardando...' : (modal.data ? 'Guardar cambios' : 'Registrar incapacidad') }}
                </button>
              </div>
            </form>

            <!-- Tab: Reincorporación -->
            <div v-else-if="incTab === 'reincorporacion' && modal.data" class="exp-subsection">
              <div class="exp-grid">
                <div class="exp-field"><label>Estado</label><span class="badge" :class="`badge--${modal.data.statusClass}`">{{ modal.data.status }}</span></div>
                <div class="exp-field"><label>N° de registro</label><span>{{ modal.data.numeroRegistro }}</span></div>
                <div class="exp-field"><label>Período</label><span>{{ modal.data.inicio }} — {{ modal.data.fin }}</span></div>
                <div class="exp-field"><label>Reincorporación prevista</label><span>{{ modal.data.reincorporacionPrevista }}</span></div>
              </div>

              <template v-if="incCamposEditables">
                <div class="form-field"><label>Fecha real de reincorporación</label><DatePicker v-model="incReincorporacionFecha" /></div>
                <div v-if="incError" class="req" style="font-size:12.5px;">{{ incError }}</div>
                <div class="modal-actions">
                  <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
                  <button type="button" class="btn-primary" :disabled="incResolviendo" @click="confirmarReincorporacionIncapacidad">Registrar reincorporación</button>
                </div>

                <div class="exp-subsection" style="margin-top:14px; border-top:1px solid #F0F4F8; padding-top:14px;">
                  <div class="form-field"><label>Motivo de anulación (solo si vas a anular este registro)</label><textarea v-model="incMotivoAnulacion" rows="2"></textarea></div>
                  <div class="modal-actions">
                    <button type="button" class="btn-primary btn-primary--danger" :disabled="incResolviendo" @click="anularIncapacidadForm">Anular registro</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="exp-grid">
                  <div v-if="modal.data.estado === 'finalizada'" class="exp-field"><label>Fecha real de reincorporación</label><span>{{ modal.data.reincorporacionReal || '—' }}</span></div>
                  <div v-if="modal.data.estado === 'anulada'" class="exp-field exp-field--full"><label>Motivo de anulación</label><span>{{ modal.data.motivoAnulacion || '—' }}</span></div>
                </div>
                <div class="modal-actions"><button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button></div>
              </template>
            </div>
          </template>

          <!-- Nueva capacitación -->
          <template v-if="modal.type === 'capacitacion'">
            <h3 class="modal-title">Nueva capacitación</h3>
            <p class="modal-subtitle">Registra una capacitación para el plan de formación</p>
            <form class="modal-form" @submit.prevent="guardarCapacitacion">
              <div class="form-field form-field--full">
                <label>Nombre / Tema <span class="req">*</span></label>
                <input v-model="capacitacionForm.nombre" type="text" placeholder="Ej: Excel avanzado para finanzas" required />
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Categoría <span class="req">*</span></label>
                  <select v-model="capacitacionForm.categoria" required>
                    <option value="">Seleccionar</option>
                    <option>Tecnología</option>
                    <option>Finanzas</option>
                    <option>Liderazgo</option>
                    <option>Normativa</option>
                    <option>Atención al asociado</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Modalidad <span class="req">*</span></label>
                  <select v-model="capacitacionForm.modalidad" required>
                    <option value="">Seleccionar</option>
                    <option>Presencial</option>
                    <option>Virtual</option>
                    <option>Mixta</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha <span class="req">*</span></label><DatePicker v-model="capacitacionForm.fecha" required /></div>
                <div class="form-field"><label>Duración (horas) <span class="req">*</span></label><input v-model="capacitacionForm.horas" type="number" min="1" placeholder="8" required /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Instructor / Proveedor</label><input v-model="capacitacionForm.instructor" type="text" placeholder="Nombre del facilitador o empresa" /></div>
                <div class="form-field">
                  <label>Estado</label>
                  <select v-model="capacitacionForm.estado">
                    <option>Programada</option>
                    <option>En curso</option>
                    <option>Finalizada</option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label>Departamentos participantes</label>
                <div class="checkbox-group">
                  <label class="checkbox-item"><input type="checkbox" /> Administración</label>
                  <label class="checkbox-item"><input type="checkbox" /> Finanzas</label>
                  <label class="checkbox-item"><input type="checkbox" /> Operaciones</label>
                  <label class="checkbox-item"><input type="checkbox" /> Todos</label>
                </div>
              </div>
              <div class="form-field"><label>Descripción</label><textarea rows="3" placeholder="Objetivos, contenido o notas sobre la capacitación..."></textarea></div>
              <div class="form-field"><label>Materiales / Adjunto</label><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" /></div>
              <div v-if="capacitacionError" class="req" style="font-size:12.5px;">{{ capacitacionError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar capacitación</button>
              </div>
            </form>
          </template>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { exportExcel, exportPDF, exportExpedientePDF, exportBoletaVacacion, exportBoletaPermiso, exportBoletaIncapacidad } from '../composables/useExport.js'
import { useAuth } from '../composables/useAuth.js'
import { usePersonal } from '../composables/usePersonal.js'
import { useCatalogosPersonal } from '../composables/useCatalogosPersonal.js'
import { useDocumentos, estadoVencimiento } from '../composables/useDocumentos.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import DatePicker from '../components/DatePicker.vue'
import TimePicker from '../components/TimePicker.vue'

const { cooperativaId, currentUser } = useAuth()
const {
  listDepartamentos, listCargos, listEmpleados, createEmpleado, updateEmpleado, eliminarEmpleado,
  findOrCreateDepartamento, findOrCreateCargo,
  listCapacitaciones, crearCapacitacion,
  listPermisosSolicitudes, crearPermisoSolicitud, actualizarPermisoSolicitud, resolverPermisoSolicitud, eliminarPermisoSolicitud,
  subirDocumentoPermiso, eliminarDocumentoPermiso,
  listIncapacidades, crearIncapacidad, actualizarIncapacidad, registrarReincorporacion, anularIncapacidad, eliminarIncapacidad,
  subirDocumentoIncapacidad, eliminarDocumentoIncapacidad,
  listVacaciones, crearSolicitudVacaciones, actualizarSolicitudVacaciones, resolverVacacionSolicitud, eliminarVacacionSolicitud,
  subirDocumentoVacacion, eliminarDocumentoVacacion,
  listContactosEmergencia, crearContactoEmergencia, eliminarContactoEmergencia,
  listContratos, crearContrato,
  listFormacionAcademica, crearFormacionAcademica, eliminarFormacionAcademica,
  listColegiaturas, crearColegiatura, eliminarColegiatura,
  listCertificacionesProfesionales, crearCertificacionProfesional, eliminarCertificacionProfesional,
  listCursosColaborador, crearCursoColaborador, eliminarCursoColaborador,
  getDatosBancarios, guardarDatosBancarios,
  listMovimientos, crearMovimiento,
  listSalidas, registrarSalida,
  listAuditoria, registrarAuditoria,
} = usePersonal()
const { listByTipo: listCatalogo, findOrCreate: findOrCreateCatalogo } = useCatalogosPersonal()
const { listDocumentos, subirDocumento, eliminarDocumento, getUrlDescarga, eliminarArchivosDelEmpleado } = useDocumentos()
const vencimientoInfo = estadoVencimiento

const activeTab = ref('dashboard')
const search = ref('')
const filterDept = ref('')
const filterStatus = ref('')
const selectedEmp = ref(null)

const modal = reactive({ open: false, type: '', data: null })

function nombreEnCatalogo(id, lista) {
  return lista.find((x) => x.id === id)?.nombre || ''
}

function nombreCompleto(emp) {
  if (!emp) return ''
  return [emp.name, emp.primerApellido, emp.segundoApellido].filter(Boolean).join(' ')
}

function empleadoInfoPara(empleadoId) {
  const emp = employees.value.find((e) => e.id === empleadoId)
  if (!emp) return {}
  return {
    name: nombreCompleto(emp),
    codigo: emp.codigoInterno || '—',
    departamento: emp.dept || '—',
    puesto: emp.role || '—',
  }
}

async function exportarBoletaVacacion(v) {
  await exportBoletaVacacion(v, empleadoInfoPara(v.empleadoId))
}

async function exportarBoletaPermiso(p) {
  await exportBoletaPermiso(p, empleadoInfoPara(p.empleadoId))
}

async function exportarBoletaIncapacidad(inc) {
  await exportBoletaIncapacidad(inc, empleadoInfoPara(inc.empleadoId))
}

const expedientesSearch = ref('')
const filteredExpedientesEmployees = computed(() => {
  const q = expedientesSearch.value.trim().toLowerCase()
  if (!q) return employees.value
  return employees.value.filter((e) => nombreCompleto(e).toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
})

/* ── Panel de detalle (pestaña Expedientes): datos de solo lectura ── */
const dContactos = ref([])
const dContratos = ref([])
const dFormacionAcademica = ref([])
const dColegiaturas = ref([])
const dCertificaciones = ref([])
const dCursos = ref([])
const dBancarios = reactive({ banco: '', tipo_cuenta: '', numero_cuenta: '', iban: '', moneda: 'CRC', estado: 'activa' })
const dBancariosSinAcceso = ref(false)

async function cargarExpedienteDetalle(empleadoId) {
  const [c, ct, f, cg, cert, cur, banc] = await Promise.all([
    listContactosEmergencia(empleadoId), listContratos(empleadoId),
    listFormacionAcademica(empleadoId), listColegiaturas(empleadoId),
    listCertificacionesProfesionales(empleadoId), listCursosColaborador(empleadoId),
    getDatosBancarios(empleadoId),
  ])
  dContactos.value = c.data || []
  dContratos.value = ct.data || []
  dFormacionAcademica.value = f.data || []
  dColegiaturas.value = cg.data || []
  dCertificaciones.value = cert.data || []
  dCursos.value = cur.data || []
  dBancariosSinAcceso.value = !!banc.error
  Object.assign(dBancarios, { banco: '', tipo_cuenta: '', numero_cuenta: '', iban: '', moneda: 'CRC', estado: 'activa' }, banc.data || {})
}

watch(selectedEmp, (emp) => {
  if (emp?.id) cargarExpedienteDetalle(emp.id)
})

async function exportarExpedientePDF() {
  if (!selectedEmp.value) return
  await exportExpedientePDF(selectedEmp.value, {
    contactos: dContactos.value,
    contratos: dContratos.value,
    formacionAcademica: dFormacionAcademica.value,
    colegiaturas: dColegiaturas.value,
    certificaciones: dCertificaciones.value,
    cursos: dCursos.value,
    bancarios: dBancariosSinAcceso.value ? null : dBancarios,
  })
}

function ddmmyyyyToInputDate(d) {
  if (!d) return ''
  const [dd, mm, yyyy] = d.split('/')
  return dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : ''
}
function inputDateToDdmmyyyy(d) {
  if (!d) return ''
  const [yyyy, mm, dd] = d.split('-')
  return dd && mm && yyyy ? `${dd}/${mm}/${yyyy}` : ''
}
function initialsFromName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] || '?').slice(0, 2).toUpperCase()
}
const AVATAR_COLORS = ['#133C65', '#1A9152', '#7B3FA0', '#C47F0C', '#C0392B', '#1565C0', '#00808C']

const EMPTY_EMP_FORM = {
  nombre: '', primerApellido: '', segundoApellido: '', tipoIdentificacion: 'Cédula nacional',
  identificacion: '', fechaNacimiento: '', nacionalidad: 'Costarricense', genero: 'Femenino', estadoCivil: '',
  telefono: '', telefonoSecundario: '', correoPersonal: '', correoInstitucional: '', correo: '',
  provincia: '', canton: '', distrito: '', direccionExacta: '', direccion: '',
  puesto: '', departamento: '', fechaIngreso: '', tipoContrato: 'Tiempo completo',
  salario: '', activo: 'true',
  codigoInterno: '', jefeInmediatoId: '', sedeId: '', jornadaId: '', horarioId: '', moneda: 'CRC', formaPago: '',
}
const empForm = reactive({ ...EMPTY_EMP_FORM })

/* ── Expediente: pestañas dentro del modal ── */
const EXPEDIENTE_TABS = [
  { key: 'personal', label: 'Información personal' },
  { key: 'laboral', label: 'Información laboral' },
  { key: 'contactos', label: 'Contactos de emergencia', requiresSaved: true },
  { key: 'contratos', label: 'Contratos', requiresSaved: true },
  { key: 'academica', label: 'Formación académica', requiresSaved: true },
  { key: 'certificaciones', label: 'Certificaciones', requiresSaved: true },
  { key: 'bancaria', label: 'Información bancaria', requiresSaved: true },
  { key: 'documentos', label: 'Documentos', requiresSaved: true },
  { key: 'historial', label: 'Historial laboral', requiresSaved: true },
  { key: 'salida', label: 'Salida', requiresSaved: true },
  { key: 'auditoria', label: 'Auditoría', requiresSaved: true },
]
const expedienteTab = ref('personal')
const expedienteTabLocked = computed(() => {
  const t = EXPEDIENTE_TABS.find((x) => x.key === expedienteTab.value)
  return !!(t?.requiresSaved && !modal.data?.id)
})

const sedes = ref([])
const tiposContratacion = ref([])
const jornadas = ref([])
const horarios = ref([])
const institucionesEducativas = ref([])
const colegiosProfesionales = ref([])
const tiposDocumento = ref([])
const tiposMovimiento = ref([])
const tiposSalida = ref([])

async function cargarCatalogosExpediente() {
  const [sedesR, tcR, jorR, horR, insR, colR, tdR, tmR, tsR, tvR, tpR, tiR, ieR] = await Promise.all([
    listCatalogo('sede'), listCatalogo('tipo_contratacion'), listCatalogo('jornada'),
    listCatalogo('horario'), listCatalogo('institucion_educativa'), listCatalogo('colegio_profesional'),
    listCatalogo('tipo_documento'), listCatalogo('tipo_movimiento'), listCatalogo('tipo_salida'),
    listCatalogo('tipo_vacacion'), listCatalogo('tipo_permiso'),
    listCatalogo('tipo_incapacidad'), listCatalogo('institucion_emisora'),
  ])
  sedes.value = sedesR.data || []
  tiposContratacion.value = tcR.data || []
  jornadas.value = jorR.data || []
  horarios.value = horR.data || []
  institucionesEducativas.value = insR.data || []
  colegiosProfesionales.value = colR.data || []
  tiposDocumento.value = tdR.data || []
  tiposMovimiento.value = tmR.data || []
  tiposSalida.value = tsR.data || []
  tiposVacacion.value = tvR.data || []
  tiposPermiso.value = tpR.data || []
  tiposIncapacidad.value = tiR.data || []
  institucionesEmisoras.value = ieR.data || []
}

const jefeOptions = computed(() => employees.value.filter((e) => e.id !== modal.data?.id))

function selectExpedienteTab(tab) {
  expedienteTab.value = tab.key
  if (tab.requiresSaved && !modal.data?.id) return
  if (tab.key === 'contactos') cargarContactos()
  else if (tab.key === 'contratos') cargarContratos()
  else if (tab.key === 'academica') { cargarFormacionAcademica(); cargarColegiaturas() }
  else if (tab.key === 'certificaciones') { cargarCertificaciones(); cargarCursos() }
  else if (tab.key === 'bancaria') cargarDatosBancarios()
  else if (tab.key === 'documentos') cargarDocumentos()
  else if (tab.key === 'historial') cargarMovimientos()
  else if (tab.key === 'salida') cargarSalidas()
  else if (tab.key === 'auditoria') cargarAuditoria()
}

function openModal(type, data = null) {
  modal.type = type
  modal.data = data
  expedienteTab.value = 'personal'
  if (type === 'editar' && data) {
    Object.assign(empForm, {
      nombre: data.name || '',
      primerApellido: data.primerApellido || '',
      segundoApellido: data.segundoApellido || '',
      tipoIdentificacion: data.tipoIdentificacion || 'Cédula nacional',
      identificacion: data.identificacion || '',
      fechaNacimiento: data.fechaNacimiento || '',
      nacionalidad: data.nacionalidad || 'Costarricense',
      genero: data.genero || 'Femenino',
      estadoCivil: data.estadoCivil || '',
      telefono: data.telefono || '',
      telefonoSecundario: data.telefonoSecundario || '',
      correoPersonal: data.correoPersonal || '',
      correoInstitucional: data.correoInstitucional || '',
      correo: data.correo || '',
      provincia: data.provincia || '',
      canton: data.canton || '',
      distrito: data.distrito || '',
      direccionExacta: data.direccionExacta || '',
      direccion: data.direccion || '',
      puesto: data.role || '',
      departamento: data.dept || '',
      fechaIngreso: ddmmyyyyToInputDate(data.date),
      tipoContrato: data.tipoContrato || 'Tiempo completo',
      salario: data.salario || '',
      activo: String(data.active),
      codigoInterno: data.codigoInterno || '',
      jefeInmediatoId: data.jefeInmediatoId || '',
      sedeId: data.sedeId || '',
      jornadaId: data.jornadaId || '',
      horarioId: data.horarioId || '',
      moneda: data.moneda || 'CRC',
      formaPago: data.formaPago || '',
    })
  } else if (type === 'nuevo') {
    Object.assign(empForm, EMPTY_EMP_FORM)
  }
  modal.open = true
}

const empFormError = ref(null)
const empFormSaving = ref(false)

async function guardarEmpleado() {
  const activo = empForm.activo === 'true'

  if (!isSupabaseConfigured()) {
    if (modal.type === 'editar' && modal.data) {
      const emp = employees.value.find(e => e.id === modal.data.id)
      if (emp) {
        Object.assign(emp, {
          name: empForm.nombre,
          identificacion: empForm.identificacion,
          fechaNacimiento: empForm.fechaNacimiento,
          genero: empForm.genero,
          telefono: empForm.telefono,
          correo: empForm.correo,
          direccion: empForm.direccion,
          role: empForm.puesto,
          dept: empForm.departamento,
          date: inputDateToDdmmyyyy(empForm.fechaIngreso) || emp.date,
          tipoContrato: empForm.tipoContrato,
          salario: empForm.salario,
          active: activo,
          initials: initialsFromName(empForm.nombre),
        })
      }
    } else {
      employees.value.push({
        id: Math.max(0, ...employees.value.map(e => e.id)) + 1,
        name: empForm.nombre,
        initials: initialsFromName(empForm.nombre),
        color: AVATAR_COLORS[employees.value.length % AVATAR_COLORS.length],
        identificacion: empForm.identificacion,
        fechaNacimiento: empForm.fechaNacimiento,
        genero: empForm.genero,
        telefono: empForm.telefono,
        correo: empForm.correo,
        direccion: empForm.direccion,
        role: empForm.puesto,
        dept: empForm.departamento,
        date: inputDateToDdmmyyyy(empForm.fechaIngreso) || '—',
        tipoContrato: empForm.tipoContrato,
        salario: empForm.salario,
        active: activo,
      })
    }
    modal.open = false
    return
  }

  empFormSaving.value = true
  empFormError.value = null

  const { data: depto, error: deptoErr } = await findOrCreateDepartamento(cooperativaId.value, empForm.departamento)
  if (deptoErr) { empFormSaving.value = false; empFormError.value = deptoErr.message; return }
  const { data: cargo, error: cargoErr } = await findOrCreateCargo(cooperativaId.value, empForm.puesto, depto?.id)
  if (cargoErr) { empFormSaving.value = false; empFormError.value = cargoErr.message; return }

  const payload = { ...empForm, cargoId: cargo?.id, departamentoId: depto?.id, activo }
  const isEdit = modal.type === 'editar' && modal.data
  const before = isEdit ? { cargoId: modal.data.cargoId, departamentoId: modal.data.departamentoId, salario: modal.data.salario } : null

  const { data: saved, error } = isEdit
    ? await updateEmpleado(modal.data.id, payload)
    : await createEmpleado(cooperativaId.value, payload)

  empFormSaving.value = false
  if (error) { empFormError.value = error.message; return }

  await Promise.all([loadEmpleados(), loadCatalogos()])

  const empleadoId = isEdit ? modal.data.id : saved.id
  const after = { cargoId: cargo?.id, departamentoId: depto?.id, salario: Number(payload.salario) || 0 }

  const { error: auditError } = await registrarAuditoria(cooperativaId.value, currentUser.value?.id, isEdit ? 'actualizar' : 'crear', empleadoId, before, after)
  if (auditError) console.warn('[Auditoría] no se pudo registrar:', auditError.message)

  if (isEdit) {
    await registrarMovimientoSiCambio(empleadoId, before, after)
  } else if (saved) {
    const { data: tipoIngreso } = await findOrCreateCatalogo(cooperativaId.value, 'tipo_movimiento', 'Ingreso')
    await crearMovimiento(cooperativaId.value, saved.id, {
      fecha: payload.fechaIngreso || new Date().toISOString().slice(0, 10),
      tipo_movimiento_id: tipoIngreso?.id || null,
      puesto_nuevo_id: cargo?.id || null,
      departamento_nuevo_id: depto?.id || null,
      salario_nuevo: after.salario,
      motivo: 'Ingreso a la cooperativa',
      realizado_por: currentUser.value?.id || null,
    })
  }

  // Tras crear, el modal pasa a modo "editar" con el id real —
  // así se habilitan las demás pestañas sin cerrar el modal.
  if (!isEdit && saved) {
    modal.type = 'editar'
    modal.data = employees.value.find((e) => e.id === saved.id) || saved
  }
}

/* ── Eliminar colaborador ── */
const eliminandoEmpleado = ref(false)
const eliminarEmpleadoError = ref(null)

function confirmarEliminarEmpleado(emp) {
  modal.type = 'eliminar'
  modal.data = emp
  eliminarEmpleadoError.value = null
  modal.open = true
}

async function eliminarEmpleadoConfirmado() {
  if (!modal.data) return
  eliminandoEmpleado.value = true
  eliminarEmpleadoError.value = null

  await eliminarArchivosDelEmpleado(modal.data.id)
  const { error } = await eliminarEmpleado(modal.data.id)

  eliminandoEmpleado.value = false
  if (error) { eliminarEmpleadoError.value = error.message; return }

  if (selectedEmp.value?.id === modal.data.id) selectedEmp.value = null
  modal.open = false
  await loadEmpleados()
}

/* ── Contactos de emergencia ── */
const contactos = ref([])
const EMPTY_CONTACTO = { nombre_completo: '', parentesco: '', telefono_principal: '', telefono_secundario: '', correo: '', es_principal: false, observaciones: '' }
const nuevoContacto = reactive({ ...EMPTY_CONTACTO })
const contactoError = ref(null)

async function cargarContactos() {
  const { data, error } = await listContactosEmergencia(modal.data.id)
  if (error) { contactoError.value = error.message; return }
  contactos.value = data || []
}
async function agregarContacto() {
  if (!nuevoContacto.nombre_completo.trim()) return
  contactoError.value = null
  const { error } = await crearContactoEmergencia(cooperativaId.value, modal.data.id, { ...nuevoContacto })
  if (error) { contactoError.value = error.message; return }
  Object.assign(nuevoContacto, EMPTY_CONTACTO)
  await cargarContactos()
}
async function quitarContacto(id) {
  await eliminarContactoEmergencia(id)
  await cargarContactos()
}

/* ── Contratos laborales ── */
const contratos = ref([])
const EMPTY_CONTRATO = { tipo_contrato_id: '', numero_contrato: '', fecha_inicio: '', fecha_fin: '', salario_pactado: '', periodo_prueba: false, estado_contrato: 'vigente', observaciones: '' }
const nuevoContrato = reactive({ ...EMPTY_CONTRATO })
const contratoError = ref(null)

async function cargarContratos() {
  const { data, error } = await listContratos(modal.data.id)
  if (error) { contratoError.value = error.message; return }
  contratos.value = data || []
}
async function agregarContrato() {
  if (!nuevoContrato.fecha_inicio) return
  contratoError.value = null
  const payload = { ...nuevoContrato, salario_pactado: Number(nuevoContrato.salario_pactado) || null, fecha_fin: nuevoContrato.fecha_fin || null, tipo_contrato_id: nuevoContrato.tipo_contrato_id || null }
  const { error } = await crearContrato(cooperativaId.value, modal.data.id, payload)
  if (error) { contratoError.value = error.message; return }
  Object.assign(nuevoContrato, EMPTY_CONTRATO)
  await cargarContratos()
}

/* ── Formación académica y colegiaturas ── */
const formacionAcademica = ref([])
const EMPTY_FORMACION = { nivel_academico: '', profesion: '', especialidad: '', institucionEducativa: '', titulo_obtenido: '', fecha_graduacion: '' }
const nuevaFormacion = reactive({ ...EMPTY_FORMACION })
const formacionError = ref(null)
const NIVELES_ACADEMICOS = ['Primaria', 'Secundaria', 'Técnico', 'Diplomado', 'Bachillerato universitario', 'Licenciatura', 'Maestría', 'Doctorado']

async function cargarFormacionAcademica() {
  const { data, error } = await listFormacionAcademica(modal.data.id)
  if (error) { formacionError.value = error.message; return }
  formacionAcademica.value = data || []
}
async function agregarFormacionAcademica() {
  if (!nuevaFormacion.nivel_academico) return
  formacionError.value = null
  const { institucionEducativa, ...rest } = nuevaFormacion
  const { data: institucion, error: instErr } = await findOrCreateCatalogo(cooperativaId.value, 'institucion_educativa', institucionEducativa)
  if (instErr) { formacionError.value = instErr.message; return }
  const payload = { ...rest, fecha_graduacion: nuevaFormacion.fecha_graduacion || null, institucion_educativa_id: institucion?.id || null }
  const { error } = await crearFormacionAcademica(cooperativaId.value, modal.data.id, payload)
  if (error) { formacionError.value = error.message; return }
  Object.assign(nuevaFormacion, EMPTY_FORMACION)
  await Promise.all([cargarFormacionAcademica(), cargarCatalogosExpediente()])
}
async function quitarFormacionAcademica(id) {
  await eliminarFormacionAcademica(id)
  await cargarFormacionAcademica()
}

const colegiaturas = ref([])
const EMPTY_COLEGIATURA = { colegioProfesional: '', numero_colegiado: '', fecha_incorporacion: '', estado: 'vigente', fecha_vencimiento: '' }
const nuevaColegiatura = reactive({ ...EMPTY_COLEGIATURA })
const colegiaturaError = ref(null)

async function cargarColegiaturas() {
  const { data, error } = await listColegiaturas(modal.data.id)
  if (error) { colegiaturaError.value = error.message; return }
  colegiaturas.value = data || []
}
async function agregarColegiatura() {
  if (!nuevaColegiatura.colegioProfesional.trim()) return
  colegiaturaError.value = null
  const { colegioProfesional, ...rest } = nuevaColegiatura
  const { data: colegio, error: colErr } = await findOrCreateCatalogo(cooperativaId.value, 'colegio_profesional', colegioProfesional)
  if (colErr) { colegiaturaError.value = colErr.message; return }
  const payload = { ...rest, fecha_incorporacion: nuevaColegiatura.fecha_incorporacion || null, fecha_vencimiento: nuevaColegiatura.fecha_vencimiento || null, colegio_profesional_id: colegio?.id || null }
  const { error } = await crearColegiatura(cooperativaId.value, modal.data.id, payload)
  if (error) { colegiaturaError.value = error.message; return }
  Object.assign(nuevaColegiatura, EMPTY_COLEGIATURA)
  await Promise.all([cargarColegiaturas(), cargarCatalogosExpediente()])
}
async function quitarColegiatura(id) {
  await eliminarColegiatura(id)
  await cargarColegiaturas()
}

/* ── Certificaciones y cursos ── */
const certificacionesProfesionales = ref([])
const EMPTY_CERTIFICACION = { nombre: '', institucion_certificadora: '', fecha_emision: '', fecha_vencimiento: '', estado: 'vigente' }
const nuevaCertificacion = reactive({ ...EMPTY_CERTIFICACION })
const certificacionError = ref(null)

async function cargarCertificaciones() {
  const { data, error } = await listCertificacionesProfesionales(modal.data.id)
  if (error) { certificacionError.value = error.message; return }
  certificacionesProfesionales.value = data || []
}
async function agregarCertificacion() {
  if (!nuevaCertificacion.nombre.trim()) return
  certificacionError.value = null
  const payload = { ...nuevaCertificacion, fecha_emision: nuevaCertificacion.fecha_emision || null, fecha_vencimiento: nuevaCertificacion.fecha_vencimiento || null }
  const { error } = await crearCertificacionProfesional(cooperativaId.value, modal.data.id, payload)
  if (error) { certificacionError.value = error.message; return }
  Object.assign(nuevaCertificacion, EMPTY_CERTIFICACION)
  await cargarCertificaciones()
}
async function quitarCertificacion(id) {
  await eliminarCertificacionProfesional(id)
  await cargarCertificaciones()
}

const cursosColaborador = ref([])
const EMPTY_CURSO = { nombre_curso: '', institucion: '', fecha: '', duracion_horas: '', modalidad: 'Presencial', tiene_certificado: false }
const nuevoCurso = reactive({ ...EMPTY_CURSO })
const cursoError = ref(null)

async function cargarCursos() {
  const { data, error } = await listCursosColaborador(modal.data.id)
  if (error) { cursoError.value = error.message; return }
  cursosColaborador.value = data || []
}
async function agregarCurso() {
  if (!nuevoCurso.nombre_curso.trim()) return
  cursoError.value = null
  const payload = { ...nuevoCurso, fecha: nuevoCurso.fecha || null, duracion_horas: Number(nuevoCurso.duracion_horas) || null }
  const { error } = await crearCursoColaborador(cooperativaId.value, modal.data.id, payload)
  if (error) { cursoError.value = error.message; return }
  Object.assign(nuevoCurso, EMPTY_CURSO)
  await cargarCursos()
}
async function quitarCurso(id) {
  await eliminarCursoColaborador(id)
  await cargarCursos()
}

/* ── Información bancaria y administrativa (mismo registro 1:1) ── */
const EMPTY_BANCARIOS = { banco: '', tipo_cuenta: '', numero_cuenta: '', iban: '', moneda: 'CRC', estado: 'activa' }
const bancariosForm = reactive({ ...EMPTY_BANCARIOS })
const bancariosError = ref(null)
const bancariosSaving = ref(false)
const bancariosSinAcceso = ref(false)

async function cargarDatosBancarios() {
  bancariosError.value = null
  bancariosSinAcceso.value = false
  const { data, error } = await getDatosBancarios(modal.data.id)
  if (error) { bancariosSinAcceso.value = true; return }
  Object.assign(bancariosForm, EMPTY_BANCARIOS, data || {})
}
async function guardarBancarios() {
  bancariosSaving.value = true
  bancariosError.value = null
  const payload = { ...bancariosForm }
  delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.cooperativa_id; delete payload.empleado_id
  const { error } = await guardarDatosBancarios(cooperativaId.value, modal.data.id, payload)
  bancariosSaving.value = false
  if (error) { bancariosError.value = error.message; return }
}

/* ── Documentos ── */
const documentos = ref([])
const nuevoDocumentoFile = ref(null)
const EMPTY_DOCUMENTO = { tipoDocumentoId: '', nombre: '', fechaEmision: '', fechaVencimiento: '', observaciones: '' }
const nuevoDocumento = reactive({ ...EMPTY_DOCUMENTO })
const documentoError = ref(null)
const documentoSubiendo = ref(false)

async function cargarDocumentos() {
  const { data, error } = await listDocumentos(modal.data.id)
  if (error) { documentoError.value = error.message; return }
  documentos.value = data || []
}
function onDocumentoFileChange(e) {
  nuevoDocumentoFile.value = e.target.files?.[0] || null
}
async function subirNuevoDocumento() {
  if (!nuevoDocumentoFile.value) { documentoError.value = 'Selecciona un archivo primero.'; return }
  documentoSubiendo.value = true
  documentoError.value = null
  const { error } = await subirDocumento(cooperativaId.value, modal.data.id, nuevoDocumentoFile.value, nuevoDocumento)
  documentoSubiendo.value = false
  if (error) { documentoError.value = error.message; return }
  Object.assign(nuevoDocumento, EMPTY_DOCUMENTO)
  nuevoDocumentoFile.value = null
  await cargarDocumentos()
}
async function descargarDocumento(doc) {
  const { url, error } = await getUrlDescarga(doc.storage_path)
  if (!error && url) window.open(url, '_blank')
}
async function quitarDocumento(doc) {
  await eliminarDocumento(doc)
  await cargarDocumentos()
}

/* ── Historial laboral ── */
const movimientos = ref([])
const EMPTY_MOVIMIENTO = { tipoMovimiento: '', fecha: '', motivo: '' }
const nuevoMovimiento = reactive({ ...EMPTY_MOVIMIENTO })
const movimientoError = ref(null)

async function cargarMovimientos() {
  const { data, error } = await listMovimientos(modal.data.id)
  if (error) { movimientoError.value = error.message; return }
  movimientos.value = data || []
}
async function agregarMovimiento() {
  if (!nuevoMovimiento.tipoMovimiento.trim()) return
  movimientoError.value = null
  const { data: tipo, error: tipoErr } = await findOrCreateCatalogo(cooperativaId.value, 'tipo_movimiento', nuevoMovimiento.tipoMovimiento)
  if (tipoErr) { movimientoError.value = tipoErr.message; return }
  const { error } = await crearMovimiento(cooperativaId.value, modal.data.id, {
    tipo_movimiento_id: tipo?.id || null,
    fecha: nuevoMovimiento.fecha || new Date().toISOString().slice(0, 10),
    motivo: nuevoMovimiento.motivo || null,
    realizado_por: currentUser.value?.id || null,
  })
  if (error) { movimientoError.value = error.message; return }
  Object.assign(nuevoMovimiento, EMPTY_MOVIMIENTO)
  await Promise.all([cargarMovimientos(), cargarCatalogosExpediente()])
}

// Registra automaticamente el cambio de puesto/departamento/salario al
// editar la informacion laboral. No requiere intervencion del usuario.
async function registrarMovimientoSiCambio(empleadoId, before, after) {
  const cambioPuesto = before.cargoId !== after.cargoId
  const cambioDepto = before.departamentoId !== after.departamentoId
  const cambioSalario = Number(before.salario) !== Number(after.salario)
  if (!cambioPuesto && !cambioDepto && !cambioSalario) return

  let tipoNombre = 'Cambio de puesto'
  if (cambioPuesto && cambioSalario && Number(after.salario) > Number(before.salario)) tipoNombre = 'Ascenso'
  else if (cambioDepto && !cambioPuesto) tipoNombre = 'Cambio de departamento'
  else if (cambioSalario && !cambioPuesto) tipoNombre = 'Aumento salarial'

  const { data: tipo } = await findOrCreateCatalogo(cooperativaId.value, 'tipo_movimiento', tipoNombre)
  await crearMovimiento(cooperativaId.value, empleadoId, {
    tipo_movimiento_id: tipo?.id || null,
    puesto_anterior_id: before.cargoId || null,
    puesto_nuevo_id: after.cargoId || null,
    departamento_anterior_id: before.departamentoId || null,
    departamento_nuevo_id: after.departamentoId || null,
    salario_anterior: Number(before.salario) || 0,
    salario_nuevo: Number(after.salario) || 0,
    realizado_por: currentUser.value?.id || null,
  })
}

/* ── Salida de la cooperativa ── */
const salidas = ref([])
const salidaFecha = ref('')
const EMPTY_SALIDA = { tipoSalida: '', motivo: '', observaciones: '' }
const nuevaSalida = reactive({ ...EMPTY_SALIDA })
const salidaError = ref(null)
const salidaSaving = ref(false)

async function cargarSalidas() {
  const { data, error } = await listSalidas(modal.data.id)
  if (error) { salidaError.value = error.message; return }
  salidas.value = data || []
}
async function registrarSalidaColaborador() {
  if (!salidaFecha.value || !nuevaSalida.tipoSalida.trim()) { salidaError.value = 'Completa la fecha y el tipo de salida.'; return }
  salidaSaving.value = true
  salidaError.value = null
  const { data: tipo, error: tipoErr } = await findOrCreateCatalogo(cooperativaId.value, 'tipo_salida', nuevaSalida.tipoSalida)
  if (tipoErr) { salidaSaving.value = false; salidaError.value = tipoErr.message; return }
  const { error } = await registrarSalida(cooperativaId.value, modal.data.id, {
    fecha_salida: salidaFecha.value,
    tipo_salida_id: tipo?.id || null,
    motivo: nuevaSalida.motivo || null,
    ultimo_puesto_id: modal.data.cargoId || null,
    ultimo_salario: Number(modal.data.salario) || null,
    observaciones: nuevaSalida.observaciones || null,
    registrado_por: currentUser.value?.id || null,
  })
  salidaSaving.value = false
  if (error) { salidaError.value = error.message; return }
  Object.assign(nuevaSalida, EMPTY_SALIDA)
  salidaFecha.value = ''
  await Promise.all([cargarSalidas(), loadEmpleados()])
}

/* ── Auditoría ── */
const auditoria = ref([])
const auditoriaError = ref(null)
async function cargarAuditoria() {
  const { data, error } = await listAuditoria(modal.data.id)
  if (error) { auditoriaError.value = error.message; return }
  auditoria.value = data || []
}

const empleadosLoadError = ref(null)

async function loadEmpleados() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listEmpleados()
  if (error) { empleadosLoadError.value = error.message; return }
  employees.value = data || []
}

const departamentos = ref([])
const cargos = ref([])

async function loadCatalogos() {
  const [{ data: deptos }, { data: cargosData }] = await Promise.all([listDepartamentos(), listCargos()])
  departamentos.value = deptos || []
  cargos.value = cargosData || []
}

onMounted(async () => {
  await Promise.all([loadEmpleados(), loadCatalogos(), cargarCatalogosExpediente()])
})

/* ── Pestañas ───────────────────────────── */
const tabs = [
  { key: 'dashboard',    label: 'Inicio',        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  { key: 'expedientes',  label: 'Expedientes',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` }, // eslint-disable-line
  { key: 'documentos',   label: 'Documentos',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { key: 'vacaciones',   label: 'Vacaciones',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { key: 'permisos',     label: 'Permisos',      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  { key: 'asistencia',   label: 'Asistencia',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { key: 'incapacidades',label: 'Incapacidades', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { key: 'capacitaciones',label:'Capacitaciones',icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { key: 'evaluaciones', label: 'Evaluaciones',  icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]

/* ── Indicadores ────────────────────────── */
const INDICATOR_META = [
  { key: 'total',       label: 'Total colaboradores',     bg: 'rgba(19,60,101,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#133C65" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { key: 'vacpend',     label: 'Vac. pendientes',         bg: 'rgba(21,101,192,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { key: 'permpend',    label: 'Permisos pendientes',     bg: 'rgba(123,63,160,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B3FA0" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  { key: 'incapact',    label: 'Incapacidades activas',   bg: 'rgba(192,57,43,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { key: 'capac',       label: 'Capacitaciones progr.',   bg: 'rgba(0,128,140,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00808C" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { key: 'cumple',      label: 'Cumpleaños del mes',      bg: 'rgba(236,64,122,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EC407A" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
]
// evalp/contratos: sin modelo de datos todavia (evaluaciones de desempeño,
// fecha de vencimiento de contrato); se omiten en vez de mostrar cifras falsas.

const indicatorValues = computed(() => {
  const mesActual = new Date().getMonth() + 1
  return {
    total: employees.value.length,
    vacpend: vacaciones.value.filter(v => v.status === 'Pendiente').length,
    permpend: permisos.value.filter(p => p.status === 'Pendiente').length,
    incapact: incapacidades.value.filter(i => i.status === 'Activa').length,
    capac: capacitaciones.value.filter(c => c.status === 'Programada').length,
    cumple: employees.value.filter(e => e.fechaNacimiento && Number(e.fechaNacimiento.slice(5, 7)) === mesActual).length,
  }
})

const indicators = computed(() => INDICATOR_META.map(m => ({ ...m, value: indicatorValues.value[m.key] ?? 0 })))

/* ── Empleados ──────────────────────────── */
const DEMO_EMPLOYEES = [
  { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', role: 'Gerente General',    dept: 'Administración', date: '01/03/2018', active: true },
  { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', role: 'Contador',           dept: 'Finanzas',       date: '15/07/2019', active: true },
  { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', role: 'Asistente Admin.',   dept: 'Administración', date: '20/01/2021', active: true },
  { id: 4, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', role: 'Operador de Caja',   dept: 'Operaciones',    date: '10/05/2020', active: false },
  { id: 5, name: 'Patricia Mora',   initials: 'PM', color: '#C0392B', role: 'Oficial de Crédito', dept: 'Operaciones',    date: '03/09/2022', active: true },
]
const employees = ref(isSupabaseConfigured() ? [] : DEMO_EMPLOYEES)

const filteredEmployees = computed(() =>
  employees.value.filter(e => {
    const matchSearch = !search.value || e.name.toLowerCase().includes(search.value.toLowerCase()) || e.role.toLowerCase().includes(search.value.toLowerCase())
    const matchDept   = !filterDept.value || e.dept === filterDept.value
    const matchStatus = filterStatus.value === '' || String(e.active) === filterStatus.value
    return matchSearch && matchDept && matchStatus
  })
)

/* ── Vacaciones (tabla dedicada, solicitud + aprobación) ── */
const vacaciones = ref([])
const permisos = ref([])
const incapacidades = ref([])

async function cargarVacaciones() {
  const { data, error } = await listVacaciones()
  if (error) { vacError.value = error.message; return }
  vacaciones.value = data || []
}
async function cargarPermisos() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listPermisosSolicitudes()
  if (!error) permisos.value = data || []
}
async function cargarIncapacidades() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listIncapacidades()
  if (!error) incapacidades.value = data || []
}
onMounted(() => { cargarVacaciones(); cargarPermisos(); cargarIncapacidades() })

const permisosStats = computed(() => ({
  total: permisos.value.length,
  horasAprobadas: permisos.value.filter(p => p.status === 'Aprobado').reduce((sum, p) => sum + (Number(p.horas) || 0), 0),
  pendientes: permisos.value.filter(p => p.status === 'Pendiente').length,
}))

const vacacionesStats = computed(() => ({
  total: vacaciones.value.length,
  diasAprobados: vacaciones.value.filter(v => v.status === 'Aprobada').reduce((sum, v) => sum + (Number(v.dias) || 0), 0),
  pendientes: vacaciones.value.filter(v => v.status === 'Pendiente').length,
}))

const incapacidadesStats = computed(() => ({
  total: incapacidades.value.length,
  diasAcumulados: incapacidades.value.reduce((sum, i) => sum + (Number(i.dias) || 0), 0),
  activas: incapacidades.value.filter(i => i.status === 'Activa').length,
}))

/* ── Filtros de las tablas de vacaciones / permisos / incapacidades ── */
const vacFiltroNumero = ref('')
const vacFiltroNombre = ref('')
const vacFiltroFecha = ref('')
const vacFiltroEstado = ref('')
const vacacionesFiltradas = computed(() => vacaciones.value.filter((v) => {
  if (vacFiltroNumero.value && !(v.numeroSolicitud || '').toLowerCase().includes(vacFiltroNumero.value.trim().toLowerCase())) return false
  if (vacFiltroNombre.value && !(v.name || '').toLowerCase().includes(vacFiltroNombre.value.trim().toLowerCase())) return false
  if (vacFiltroFecha.value && !(v.fechaInicioISO <= vacFiltroFecha.value && vacFiltroFecha.value <= v.fechaFinISO)) return false
  if (vacFiltroEstado.value && v.status !== vacFiltroEstado.value) return false
  return true
}))

const permFiltroNumero = ref('')
const permFiltroNombre = ref('')
const permFiltroFecha = ref('')
const permFiltroEstado = ref('')
const permisosFiltrados = computed(() => permisos.value.filter((p) => {
  if (permFiltroNumero.value && !(p.numeroSolicitud || '').toLowerCase().includes(permFiltroNumero.value.trim().toLowerCase())) return false
  if (permFiltroNombre.value && !(p.name || '').toLowerCase().includes(permFiltroNombre.value.trim().toLowerCase())) return false
  if (permFiltroFecha.value && !(p.fechaInicioISO <= permFiltroFecha.value && permFiltroFecha.value <= p.fechaFinISO)) return false
  if (permFiltroEstado.value && p.status !== permFiltroEstado.value) return false
  return true
}))

const incFiltroNumero = ref('')
const incFiltroNombre = ref('')
const incFiltroFecha = ref('')
const incFiltroEstado = ref('')
const incapacidadesFiltradas = computed(() => incapacidades.value.filter((i) => {
  if (incFiltroNumero.value && !(i.numeroRegistro || '').toLowerCase().includes(incFiltroNumero.value.trim().toLowerCase())) return false
  if (incFiltroNombre.value && !(i.name || '').toLowerCase().includes(incFiltroNombre.value.trim().toLowerCase())) return false
  if (incFiltroFecha.value && !(i.fechaInicioISO <= incFiltroFecha.value && incFiltroFecha.value <= i.fechaFinISO)) return false
  if (incFiltroEstado.value && i.status !== incFiltroEstado.value) return false
  return true
}))

/* ── Solicitud + aprobación de vacaciones (modal en pestañas) ── */
const vacTab = ref('solicitud')
const EMPTY_VAC_FORM = { empleadoId: '', tipoVacacionId: '', fechaInicio: '', fechaFin: '', diasSolicitados: '', diasHabiles: '', observaciones: '' }
const vacForm = reactive({ ...EMPTY_VAC_FORM })
const vacError = ref(null)
const vacSaving = ref(false)
const vacResolviendo = ref(false)
const vacAprobacionComentario = ref('')
const vacAprobacionMotivo = ref('')
const tiposVacacion = ref([])
const tiposPermiso = ref([])
const tiposIncapacidad = ref([])
const institucionesEmisoras = ref([])
const vacArchivoNuevo = ref(null)
const vacDocumentoActual = ref(null)
function onVacArchivoChange(e) { vacArchivoNuevo.value = e.target.files[0] || null }

const vacEmpleadoInfo = computed(() => {
  const emp = employees.value.find((e) => e.id === vacForm.empleadoId)
  if (!emp) return null
  return {
    codigo: emp.codigoInterno || '—',
    departamento: emp.dept || '—',
    puesto: emp.role || '—',
    jefatura: employees.value.find((j) => j.id === emp.jefeInmediatoId)?.name || '—',
    fechaIngreso: emp.date || '—',
  }
})

// Saldo simplificado: 1 día generado por cada mes completo desde el ingreso,
// menos los días ya usados en solicitudes aprobadas. El sistema de saldos/
// movimientos completo del documento (secciones 6, 16, 17) queda pendiente.
function mesesAcumulados(fechaIngresoISO) {
  if (!fechaIngresoISO) return 0
  const ini = new Date(fechaIngresoISO)
  const hoy = new Date()
  let meses = (hoy.getFullYear() - ini.getFullYear()) * 12 + (hoy.getMonth() - ini.getMonth())
  if (hoy.getDate() < ini.getDate()) meses--
  return Math.max(0, meses)
}

// Se puede editar una solicitud nueva, o una existente mientras siga
// pendiente de revisión; una vez aprobada/rechazada/cancelada queda fija.
const vacCamposEditables = computed(() => !modal.data || modal.data.estado === 'pendiente')

const vacDiasDisponibles = computed(() => {
  const emp = employees.value.find((e) => e.id === vacForm.empleadoId)
  if (!emp) return null
  const generados = mesesAcumulados(emp.fechaIngresoISO)
  const usados = vacaciones.value
    .filter((v) => v.empleadoId === emp.id && v.estado === 'aprobada')
    .reduce((sum, v) => sum + (Number(v.dias) || 0), 0)
  return generados - usados
})

function calcularDiasVacacion() {
  if (!vacForm.fechaInicio || !vacForm.fechaFin) { vacForm.diasSolicitados = ''; vacForm.diasHabiles = ''; return }
  const ini = new Date(vacForm.fechaInicio)
  const fin = new Date(vacForm.fechaFin)
  if (fin < ini) { vacForm.diasSolicitados = ''; vacForm.diasHabiles = ''; return }
  let total = 0, habiles = 0
  for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
    total++
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) habiles++
  }
  vacForm.diasSolicitados = total
  vacForm.diasHabiles = habiles
}
watch(() => [vacForm.fechaInicio, vacForm.fechaFin], calcularDiasVacacion)

function abrirNuevaVacacion() {
  modal.type = 'vacacion'
  modal.data = null
  vacTab.value = 'solicitud'
  Object.assign(vacForm, EMPTY_VAC_FORM)
  vacError.value = null
  vacArchivoNuevo.value = null
  vacDocumentoActual.value = null
  modal.open = true
}

function abrirRevisarVacacion(v) {
  modal.type = 'vacacion'
  modal.data = v
  vacTab.value = 'solicitud'
  Object.assign(vacForm, {
    empleadoId: v.empleadoId,
    tipoVacacionId: v.tipoVacacionId || '',
    fechaInicio: v.fechaInicioISO,
    fechaFin: v.fechaFinISO,
    diasSolicitados: v.dias,
    diasHabiles: v.diasHabiles ?? '',
    observaciones: v.observaciones || '',
  })
  vacAprobacionComentario.value = ''
  vacAprobacionMotivo.value = ''
  vacError.value = null
  vacArchivoNuevo.value = null
  vacDocumentoActual.value = v.documentoPath ? { path: v.documentoPath, nombre: v.documentoNombre } : null
  modal.open = true
}

async function verDocumentoVacacion() {
  if (!vacDocumentoActual.value) return
  const { url, error } = await getUrlDescarga(vacDocumentoActual.value.path)
  if (error || !url) { vacError.value = error?.message || 'No se pudo generar el enlace de descarga.'; return }
  window.open(url, '_blank')
}

async function quitarDocumentoVacacion() {
  if (!modal.data || !vacDocumentoActual.value) return
  if (!confirm('¿Quitar el documento adjunto de esta solicitud?')) return
  const { error } = await eliminarDocumentoVacacion(modal.data.id, vacDocumentoActual.value.path)
  if (error) { vacError.value = error.message; return }
  vacDocumentoActual.value = null
  await cargarVacaciones()
}

async function enviarSolicitudVacacion() {
  vacError.value = null
  if (!vacForm.empleadoId || !vacForm.fechaInicio || !vacForm.fechaFin) { vacError.value = 'Completa colaborador y fechas.'; return }
  if (new Date(vacForm.fechaFin) < new Date(vacForm.fechaInicio)) { vacError.value = 'La fecha de finalización no puede ser anterior a la fecha de inicio.'; return }

  if (vacDiasDisponibles.value !== null && Number(vacForm.diasSolicitados) > vacDiasDisponibles.value) {
    vacError.value = `No hay suficientes días disponibles (disponibles: ${vacDiasDisponibles.value}, solicitados: ${vacForm.diasSolicitados}).`
    return
  }

  const traslape = vacaciones.value.some((v) =>
    v.id !== modal.data?.id &&
    v.empleadoId === vacForm.empleadoId &&
    v.estado !== 'rechazada' && v.estado !== 'cancelada' &&
    vacForm.fechaInicio <= v.fechaFinISO && vacForm.fechaFin >= v.fechaInicioISO
  )
  if (traslape) { vacError.value = 'Este colaborador ya tiene una solicitud de vacaciones registrada en ese período.'; return }

  vacSaving.value = true
  const { data, error } = modal.data
    ? await actualizarSolicitudVacaciones(modal.data.id, vacForm)
    : await crearSolicitudVacaciones(cooperativaId.value, vacForm.empleadoId, vacForm)
  if (error) { vacSaving.value = false; vacError.value = error.message; return }

  if (vacArchivoNuevo.value) {
    const solicitudId = modal.data ? modal.data.id : data.id
    if (vacDocumentoActual.value) await eliminarDocumentoVacacion(solicitudId, vacDocumentoActual.value.path)
    const { error: upErr } = await subirDocumentoVacacion(cooperativaId.value, vacForm.empleadoId, solicitudId, vacArchivoNuevo.value)
    if (upErr) {
      vacSaving.value = false
      vacError.value = 'La solicitud se guardó, pero el documento no se pudo subir: ' + upErr.message
      await cargarVacaciones()
      return
    }
  }

  vacSaving.value = false
  await cargarVacaciones()
  modal.open = false
}

async function aprobarVacacion() {
  vacResolviendo.value = true
  vacError.value = null
  const { error } = await resolverVacacionSolicitud(modal.data.id, { aprobado: true, aprobadoPor: currentUser.value?.id, comentario: vacAprobacionComentario.value })
  vacResolviendo.value = false
  if (error) { vacError.value = error.message; return }
  await cargarVacaciones()
  modal.open = false
}

async function rechazarVacacion() {
  if (!vacAprobacionMotivo.value.trim()) { vacError.value = 'Debes indicar el motivo de rechazo.'; return }
  vacResolviendo.value = true
  vacError.value = null
  const { error } = await resolverVacacionSolicitud(modal.data.id, { aprobado: false, aprobadoPor: currentUser.value?.id, motivoRechazo: vacAprobacionMotivo.value })
  vacResolviendo.value = false
  if (error) { vacError.value = error.message; return }
  await cargarVacaciones()
  modal.open = false
}

/* ── Eliminar solicitud de vacaciones ── */
const eliminandoVacacion = ref(false)
const eliminarVacacionError = ref(null)

function confirmarEliminarVacacion(v) {
  modal.type = 'eliminar-vacacion'
  modal.data = v
  eliminarVacacionError.value = null
  modal.open = true
}

async function eliminarVacacionConfirmada() {
  if (!modal.data) return
  eliminandoVacacion.value = true
  eliminarVacacionError.value = null
  const { error } = await eliminarVacacionSolicitud(modal.data.id)
  eliminandoVacacion.value = false
  if (error) { eliminarVacacionError.value = error.message; return }
  modal.open = false
  await cargarVacaciones()
}

/* ── Solicitud + aprobación de permisos (modal en pestañas) ── */
const permTab = ref('solicitud')
const EMPTY_PERM_FORM = { empleadoId: '', tipoPermisoId: '', fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '', cantidadDias: '', cantidadHoras: '', motivo: '', observaciones: '' }
const permForm = reactive({ ...EMPTY_PERM_FORM })
const permError = ref(null)
const permSaving = ref(false)
const permResolviendo = ref(false)
const permAprobacionComentario = ref('')
const permAprobacionMotivo = ref('')
const permArchivoNuevo = ref(null)
const permDocumentoActual = ref(null)
function onPermArchivoChange(e) { permArchivoNuevo.value = e.target.files[0] || null }

const permEmpleadoInfo = computed(() => {
  const emp = employees.value.find((e) => e.id === permForm.empleadoId)
  if (!emp) return null
  return {
    codigo: emp.codigoInterno || '—',
    departamento: emp.dept || '—',
    puesto: emp.role || '—',
    jefatura: employees.value.find((j) => j.id === emp.jefeInmediatoId)?.name || '—',
    fechaIngreso: emp.date || '—',
  }
})

// Se puede editar una solicitud nueva, o una existente mientras siga
// pendiente de revisión; una vez aprobada/rechazada/cancelada queda fija.
const permCamposEditables = computed(() => !modal.data || modal.data.estado === 'pendiente')

// Duración automática: si inicio y fin son el mismo día y hay horas, calcula
// horas; si abarca varios días, calcula días completos.
function calcularDuracionPermiso() {
  if (!permForm.fechaInicio || !permForm.fechaFin) { permForm.cantidadDias = ''; permForm.cantidadHoras = ''; return }
  const ini = new Date(permForm.fechaInicio)
  const fin = new Date(permForm.fechaFin)
  if (fin < ini) { permForm.cantidadDias = ''; permForm.cantidadHoras = ''; return }
  if (permForm.fechaInicio === permForm.fechaFin && permForm.horaInicio && permForm.horaFin) {
    const [hi, mi] = permForm.horaInicio.split(':').map(Number)
    const [hf, mf] = permForm.horaFin.split(':').map(Number)
    const horas = (hf * 60 + mf - (hi * 60 + mi)) / 60
    permForm.cantidadHoras = horas > 0 ? Number(horas.toFixed(2)) : ''
    permForm.cantidadDias = ''
  } else {
    let dias = 0
    for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) dias++
    permForm.cantidadDias = dias
    permForm.cantidadHoras = ''
  }
}
watch(() => [permForm.fechaInicio, permForm.fechaFin, permForm.horaInicio, permForm.horaFin], calcularDuracionPermiso)

function abrirNuevoPermiso() {
  modal.type = 'permiso'
  modal.data = null
  permTab.value = 'solicitud'
  Object.assign(permForm, EMPTY_PERM_FORM)
  permError.value = null
  permArchivoNuevo.value = null
  permDocumentoActual.value = null
  modal.open = true
}

function abrirRevisarPermiso(p) {
  modal.type = 'permiso'
  modal.data = p
  permTab.value = 'solicitud'
  Object.assign(permForm, {
    empleadoId: p.empleadoId,
    tipoPermisoId: p.tipoPermisoId || '',
    fechaInicio: p.fechaInicioISO,
    fechaFin: p.fechaFinISO,
    horaInicio: p.horaInicio || '',
    horaFin: p.horaFin || '',
    cantidadDias: p.dias ?? '',
    cantidadHoras: p.horas ?? '',
    motivo: p.motivo || '',
    observaciones: p.observaciones || '',
  })
  permAprobacionComentario.value = ''
  permAprobacionMotivo.value = ''
  permError.value = null
  permArchivoNuevo.value = null
  permDocumentoActual.value = p.documentoPath ? { path: p.documentoPath, nombre: p.documentoNombre } : null
  modal.open = true
}

async function verDocumentoPermiso() {
  if (!permDocumentoActual.value) return
  const { url, error } = await getUrlDescarga(permDocumentoActual.value.path)
  if (error || !url) { permError.value = error?.message || 'No se pudo generar el enlace de descarga.'; return }
  window.open(url, '_blank')
}

async function quitarDocumentoPermiso() {
  if (!modal.data || !permDocumentoActual.value) return
  if (!confirm('¿Quitar el documento adjunto de esta solicitud?')) return
  const { error } = await eliminarDocumentoPermiso(modal.data.id, permDocumentoActual.value.path)
  if (error) { permError.value = error.message; return }
  permDocumentoActual.value = null
  await cargarPermisos()
}

async function enviarSolicitudPermiso() {
  permError.value = null
  if (!permForm.empleadoId || !permForm.fechaInicio || !permForm.fechaFin) { permError.value = 'Completa colaborador y fechas.'; return }
  if (new Date(permForm.fechaFin) < new Date(permForm.fechaInicio)) { permError.value = 'La fecha de finalización no puede ser anterior a la fecha de inicio.'; return }

  permSaving.value = true
  const { data, error } = modal.data
    ? await actualizarPermisoSolicitud(modal.data.id, permForm)
    : await crearPermisoSolicitud(cooperativaId.value, permForm.empleadoId, permForm)
  if (error) { permSaving.value = false; permError.value = error.message; return }

  if (permArchivoNuevo.value) {
    const solicitudId = modal.data ? modal.data.id : data.id
    if (permDocumentoActual.value) await eliminarDocumentoPermiso(solicitudId, permDocumentoActual.value.path)
    const { error: upErr } = await subirDocumentoPermiso(cooperativaId.value, permForm.empleadoId, solicitudId, permArchivoNuevo.value)
    if (upErr) {
      permSaving.value = false
      permError.value = 'La solicitud se guardó, pero el documento no se pudo subir: ' + upErr.message
      await cargarPermisos()
      return
    }
  }

  permSaving.value = false
  await cargarPermisos()
  modal.open = false
}

async function aprobarPermiso() {
  permResolviendo.value = true
  permError.value = null
  const { error } = await resolverPermisoSolicitud(modal.data.id, { aprobado: true, aprobadoPor: currentUser.value?.id, comentario: permAprobacionComentario.value })
  permResolviendo.value = false
  if (error) { permError.value = error.message; return }
  await cargarPermisos()
  modal.open = false
}

async function rechazarPermiso() {
  if (!permAprobacionMotivo.value.trim()) { permError.value = 'Debes indicar el motivo de rechazo.'; return }
  permResolviendo.value = true
  permError.value = null
  const { error } = await resolverPermisoSolicitud(modal.data.id, { aprobado: false, aprobadoPor: currentUser.value?.id, motivoRechazo: permAprobacionMotivo.value })
  permResolviendo.value = false
  if (error) { permError.value = error.message; return }
  await cargarPermisos()
  modal.open = false
}

/* ── Eliminar solicitud de permiso ── */
const eliminandoPermiso = ref(false)
const eliminarPermisoError = ref(null)

function confirmarEliminarPermiso(p) {
  modal.type = 'eliminar-permiso'
  modal.data = p
  eliminarPermisoError.value = null
  modal.open = true
}

async function eliminarPermisoConfirmada() {
  if (!modal.data) return
  eliminandoPermiso.value = true
  eliminarPermisoError.value = null
  const { error } = await eliminarPermisoSolicitud(modal.data.id)
  eliminandoPermiso.value = false
  if (error) { eliminarPermisoError.value = error.message; return }
  modal.open = false
  await cargarPermisos()
}

/* ── Registro + reincorporación de incapacidades (modal en pestañas) ── */
const incTab = ref('registro')
const EMPTY_INC_FORM = { empleadoId: '', tipoIncapacidadId: '', institucionEmisoraId: '', numeroReferencia: '', fechaEmision: '', fechaInicio: '', fechaFin: '', cantidadDias: '', fechaReincorporacionPrevista: '', observaciones: '' }
const incForm = reactive({ ...EMPTY_INC_FORM })
const incError = ref(null)
const incSaving = ref(false)
const incResolviendo = ref(false)
const incReincorporacionFecha = ref('')
const incMotivoAnulacion = ref('')
const incArchivoNuevo = ref(null)
const incDocumentoActual = ref(null)
let incReincorporacionAuto = true
let incAplicandoAuto = false
function onIncArchivoChange(e) { incArchivoNuevo.value = e.target.files[0] || null }

const incEmpleadoInfo = computed(() => {
  const emp = employees.value.find((e) => e.id === incForm.empleadoId)
  if (!emp) return null
  return {
    codigo: emp.codigoInterno || '—',
    departamento: emp.dept || '—',
    puesto: emp.role || '—',
    jefatura: employees.value.find((j) => j.id === emp.jefeInmediatoId)?.name || '—',
    fechaIngreso: emp.date || '—',
  }
})

// Se puede editar un registro nuevo, o uno existente mientras no esté
// finalizado (reincorporación registrada) ni anulado.
const incCamposEditables = computed(() => !modal.data || (modal.data.estado !== 'finalizada' && modal.data.estado !== 'anulada'))

function pad2(n) { return String(n).padStart(2, '0') }
function isoFromDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }

// Calcula los días de incapacidad y sugiere la fecha de reincorporación
// prevista (día siguiente al fin) mientras el usuario no la haya editado
// manualmente.
function calcularDiasIncapacidad() {
  if (!incForm.fechaInicio || !incForm.fechaFin) { incForm.cantidadDias = ''; return }
  const ini = new Date(incForm.fechaInicio)
  const fin = new Date(incForm.fechaFin)
  if (fin < ini) { incForm.cantidadDias = ''; return }
  let dias = 0
  for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) dias++
  incForm.cantidadDias = dias
  if (incReincorporacionAuto) {
    incAplicandoAuto = true
    const rein = new Date(fin)
    rein.setDate(rein.getDate() + 1)
    incForm.fechaReincorporacionPrevista = isoFromDate(rein)
  }
}
watch(() => [incForm.fechaInicio, incForm.fechaFin], calcularDiasIncapacidad)
watch(() => incForm.fechaReincorporacionPrevista, () => {
  if (incAplicandoAuto) { incAplicandoAuto = false; return }
  incReincorporacionAuto = false
})

function abrirNuevaIncapacidad() {
  modal.type = 'incapacidad'
  modal.data = null
  incTab.value = 'registro'
  Object.assign(incForm, EMPTY_INC_FORM)
  incReincorporacionAuto = true
  incError.value = null
  incArchivoNuevo.value = null
  incDocumentoActual.value = null
  modal.open = true
}

function abrirRevisarIncapacidad(inc) {
  modal.type = 'incapacidad'
  modal.data = inc
  incTab.value = 'registro'
  Object.assign(incForm, {
    empleadoId: inc.empleadoId,
    tipoIncapacidadId: inc.tipoIncapacidadId || '',
    institucionEmisoraId: inc.institucionEmisoraId || '',
    numeroReferencia: inc.numeroReferencia || '',
    fechaEmision: inc.fechaEmisionISO || '',
    fechaInicio: inc.fechaInicioISO,
    fechaFin: inc.fechaFinISO,
    cantidadDias: inc.dias ?? '',
    fechaReincorporacionPrevista: inc.reincorporacionPrevistaISO || '',
    observaciones: inc.observaciones || '',
  })
  incReincorporacionAuto = false
  incReincorporacionFecha.value = inc.reincorporacionPrevistaISO || ''
  incMotivoAnulacion.value = ''
  incError.value = null
  incArchivoNuevo.value = null
  incDocumentoActual.value = inc.documentoPath ? { path: inc.documentoPath, nombre: inc.documentoNombre } : null
  modal.open = true
}

async function verDocumentoIncapacidad() {
  if (!incDocumentoActual.value) return
  const { url, error } = await getUrlDescarga(incDocumentoActual.value.path)
  if (error || !url) { incError.value = error?.message || 'No se pudo generar el enlace de descarga.'; return }
  window.open(url, '_blank')
}

async function quitarDocumentoIncapacidad() {
  if (!modal.data || !incDocumentoActual.value) return
  if (!confirm('¿Quitar el documento adjunto de este registro?')) return
  const { error } = await eliminarDocumentoIncapacidad(modal.data.id, incDocumentoActual.value.path)
  if (error) { incError.value = error.message; return }
  incDocumentoActual.value = null
  await cargarIncapacidades()
}

async function enviarRegistroIncapacidad() {
  incError.value = null
  if (!incForm.empleadoId || !incForm.fechaInicio || !incForm.fechaFin) { incError.value = 'Completa colaborador y fechas.'; return }
  if (new Date(incForm.fechaFin) < new Date(incForm.fechaInicio)) { incError.value = 'La fecha de finalización no puede ser anterior a la fecha de inicio.'; return }

  incSaving.value = true
  const { data, error } = modal.data
    ? await actualizarIncapacidad(modal.data.id, incForm)
    : await crearIncapacidad(cooperativaId.value, incForm.empleadoId, incForm)
  if (error) { incSaving.value = false; incError.value = error.message; return }

  if (incArchivoNuevo.value) {
    const incapacidadId = modal.data ? modal.data.id : data.id
    if (incDocumentoActual.value) await eliminarDocumentoIncapacidad(incapacidadId, incDocumentoActual.value.path)
    const { error: upErr } = await subirDocumentoIncapacidad(cooperativaId.value, incForm.empleadoId, incapacidadId, incArchivoNuevo.value)
    if (upErr) {
      incSaving.value = false
      incError.value = 'El registro se guardó, pero el documento no se pudo subir: ' + upErr.message
      await cargarIncapacidades()
      return
    }
  }

  incSaving.value = false
  await cargarIncapacidades()
  modal.open = false
}

async function confirmarReincorporacionIncapacidad() {
  if (!incReincorporacionFecha.value) { incError.value = 'Indica la fecha real de reincorporación.'; return }
  incResolviendo.value = true
  incError.value = null
  const { error } = await registrarReincorporacion(modal.data.id, { fechaReal: incReincorporacionFecha.value })
  incResolviendo.value = false
  if (error) { incError.value = error.message; return }
  await cargarIncapacidades()
  modal.open = false
}

async function anularIncapacidadForm() {
  if (!incMotivoAnulacion.value.trim()) { incError.value = 'Indica el motivo de anulación.'; return }
  incResolviendo.value = true
  incError.value = null
  const { error } = await anularIncapacidad(modal.data.id, incMotivoAnulacion.value)
  incResolviendo.value = false
  if (error) { incError.value = error.message; return }
  await cargarIncapacidades()
  modal.open = false
}

/* ── Eliminar registro de incapacidad ── */
const eliminandoIncapacidad = ref(false)
const eliminarIncapacidadError = ref(null)

function confirmarEliminarIncapacidad(inc) {
  modal.type = 'eliminar-incapacidad'
  modal.data = inc
  eliminarIncapacidadError.value = null
  modal.open = true
}

async function eliminarIncapacidadConfirmada() {
  if (!modal.data) return
  eliminandoIncapacidad.value = true
  eliminarIncapacidadError.value = null
  const { error } = await eliminarIncapacidad(modal.data.id)
  eliminandoIncapacidad.value = false
  if (error) { eliminarIncapacidadError.value = error.message; return }
  modal.open = false
  await cargarIncapacidades()
}

// Documentos, asistencia y evaluaciones de desempeño no tienen tabla propia
// todavia en el esquema (no hay `documentos`, `evaluaciones_desempeno` ni
// tabla de marcaje diario). En vez de simular datos, estas pestañas muestran
// un estado vacio honesto hasta que se coordine el modelo de datos
// correspondiente.
const asistencias = []

/* ── Capacitaciones mock ────────────────── */
const DEMO_CAPACITACIONES = [
  { id: 1, nombre: 'Excel avanzado para finanzas', depto: 'Finanzas', categoria: 'Tecnología',  modalidad: 'Virtual',     modalidadClass: 'virtual',     fecha: '05/05/2026', horas: 16, instructor: 'TechPro CR',     asistentes: 8,  status: 'Finalizada',  statusClass: 'green' },
  { id: 2, nombre: 'Atención al asociado',         depto: 'Operaciones', categoria: 'Servicio', modalidad: 'Presencial',   modalidadClass: 'presencial',  fecha: '12/05/2026', horas: 8,  instructor: 'Laura Soto',     asistentes: 14, status: 'Finalizada',  statusClass: 'green' },
  { id: 3, nombre: 'Normativa SUGEF actualizada',  depto: 'Todos',       categoria: 'Normativa',modalidad: 'Virtual',     modalidadClass: 'virtual',     fecha: '20/06/2026', horas: 4,  instructor: 'SUGEF',          asistentes: 28, status: 'Programada',  statusClass: 'blue' },
  { id: 4, nombre: 'Liderazgo y trabajo en equipo',depto: 'Admin.',      categoria: 'Liderazgo',modalidad: 'Mixta',       modalidadClass: 'mixta',       fecha: '10/07/2026', horas: 12, instructor: 'Consultores SA', asistentes: 6,  status: 'Programada',  statusClass: 'blue' },
  { id: 5, nombre: 'Prevención de riesgos',        depto: 'Todos',       categoria: 'Normativa',modalidad: 'Presencial',  modalidadClass: 'presencial',  fecha: '15/03/2026', horas: 6,  instructor: 'INS',            asistentes: 32, status: 'Finalizada',  statusClass: 'green' },
]
const capacitaciones = ref(isSupabaseConfigured() ? [] : DEMO_CAPACITACIONES)

async function loadCapacitaciones() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listCapacitaciones()
  if (!error) capacitaciones.value = data || []
}
onMounted(loadCapacitaciones)

const capacitacionesStats = computed(() => {
  const list = capacitaciones.value
  return {
    finalizadas: list.filter(c => c.status === 'Finalizada').length,
    programadas: list.filter(c => c.status === 'Programada').length,
    horas: list.reduce((sum, c) => sum + (Number(c.horas) || 0), 0),
    asistentes: list.reduce((sum, c) => sum + (Number(c.asistentes) || 0), 0),
  }
})

const capacitacionForm = reactive({ nombre: '', categoria: '', modalidad: '', fecha: '', horas: '', instructor: '', estado: 'Programada' })
const capacitacionError = ref(null)

async function guardarCapacitacion() {
  if (!isSupabaseConfigured()) { modal.open = false; return }
  if (!capacitacionForm.nombre || !capacitacionForm.categoria || !capacitacionForm.modalidad || !capacitacionForm.fecha || !capacitacionForm.horas) return
  capacitacionError.value = null
  const { error } = await crearCapacitacion(cooperativaId.value, capacitacionForm)
  if (error) { capacitacionError.value = error.message; return }
  Object.assign(capacitacionForm, { nombre: '', categoria: '', modalidad: '', fecha: '', horas: '', instructor: '', estado: 'Programada' })
  await loadCapacitaciones()
  modal.open = false
}

</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 18px; }

/* Header */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

/* ── Tabs ───────────────────────────────── */
.tabs-wrap {
  overflow-x: auto;
  border-bottom: 2px solid #E8EEF4;
  flex-shrink: 0;
}
.dark .tabs-wrap { border-color: #3D5069; }

.tabs-nav {
  display: flex;
  gap: 0;
  min-width: max-content;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #7A90A0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover { color: #133C65; }
.dark .tab-btn:hover { color: #E2E8F0; }

.tab-btn--active {
  color: #133C65;
  border-bottom-color: #133C65;
  font-weight: 700;
}
.dark .tab-btn--active { color: #93B8D8; border-bottom-color: #93B8D8; }

/* ── Indicators ─────────────────────────── */
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.indicator-card {
  background: white;
  border: 1px solid #E8EEF4;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(19,60,101,0.06);
}
.dark .indicator-card { background: #1D293D; border-color: #3D5069; }

.ind-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ind-icon svg { width: 15px; height: 15px; }
.ind-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ind-value {
  font-size: 18px; font-weight: 800; color: #133C65; line-height: 1;
  font-variant-numeric: tabular-nums; letter-spacing: -0.5px;
}
.dark .ind-value { color: #E2E8F0; }
.ind-label {
  font-size: 10.5px; color: #7A90A0; font-weight: 500; line-height: 1.25;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dark .ind-label { color: #64748B; }

/* ── Filters ────────────────────────────── */
.filters-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #7A90A0; pointer-events: none; }
.search-input {
  width: 100%; height: 38px; padding: 0 12px 0 34px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .search-input { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }
.search-input:focus { border-color: #133C65; }
.search-input--sm { height: 34px; font-size: 13px; }

.filter-select {
  height: 38px; padding: 0 10px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; cursor: pointer; outline: none;
}
.dark .filter-select { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

.filter-date { width: 150px; flex-shrink: 0; }

/* ── Table ──────────────────────────────── */
.data-card {
  background: white; border-radius: 12px;
  border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 11px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 12px 16px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #3D5069; }
.data-table tbody tr:hover { background: #F8FAFC; }
.dark .data-table tbody tr:hover { background: rgba(255,255,255,0.04); }
.data-table tbody tr:last-child td { border-bottom: none; }

.cell-user { display: flex; align-items: center; gap: 10px; }
.cell-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cell-avatar--sm { width: 32px; height: 32px; font-size: 11px; }
.cell-avatar--lg { width: 52px; height: 52px; font-size: 16px; flex-shrink: 0; }

.cell-actions { white-space: nowrap; }

.badge { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.badge--xs { font-size: 10px; padding: 2px 7px; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.badge--blue   { background: rgba(19,60,101,0.1); color: #133C65; }
.dark .badge--green  { background: rgba(74,222,128,0.15);  color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBBF24; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }
.dark .badge--blue   { background: rgba(96,165,250,0.18);  color: #60A5FA; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }

.action-btn {
  background: none; border: none; color: #7A90A0; cursor: pointer;
  padding: 5px; border-radius: 6px; transition: color 0.12s, background 0.12s;
  display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }
.action-btn--green:hover { color: #1A9152; background: rgba(26,145,82,0.1); }
.action-btn--red:hover { color: #C0392B; background: rgba(192,57,43,0.1); }

.empty-row { text-align: center; color: #B0C0D0; padding: 32px; font-size: 13.5px; }

/* ── Expedientes ────────────────────────── */
.exp-layout { display: grid; grid-template-columns: 260px 1fr; gap: 18px; align-items: start; }

.exp-sidebar {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .exp-sidebar { background: #1D293D; border-color: #3D5069; }

.exp-search-wrap {
  position: relative; padding: 12px 12px 8px;
  border-bottom: 1px solid #F0F4F8;
}
.dark .exp-search-wrap { border-color: #3D5069; }

.exp-list { display: flex; flex-direction: column; max-height: 480px; overflow-y: auto; }

.exp-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  cursor: pointer; border-bottom: 1px solid #F0F4F8; transition: background 0.12s;
}
.dark .exp-item { border-color: #3D5069; }
.exp-item:hover { background: #F8FAFC; }
.dark .exp-item:hover { background: rgba(255,255,255,0.04); }
.exp-item--active { background: #EBF3FF; }
.dark .exp-item--active { background: rgba(19,60,101,0.2); }
.exp-item:last-child { border-bottom: none; }

.exp-item-info { flex: 1; min-width: 0; }
.exp-item-name { display: block; font-size: 13px; font-weight: 600; color: #1A2B3C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dark .exp-item-name { color: #E2E8F0; }
.exp-item-role { display: block; font-size: 11px; color: #7A90A0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.exp-detail {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); padding: 22px;
  display: flex; flex-direction: column; gap: 20px;
}
.dark .exp-detail { background: #1D293D; border-color: #3D5069; }

.exp-detail-header { display: flex; align-items: center; gap: 14px; }
.exp-name { font-size: 18px; font-weight: 700; color: #133C65; }
.dark .exp-name { color: #E2E8F0; }
.exp-role { font-size: 13px; color: #4A6070; margin-top: 2px; }

.exp-sections { display: flex; flex-direction: column; gap: 18px; }

.exp-section {
  border: 1px solid #F0F4F8; border-radius: 10px; padding: 16px;
}
.dark .exp-section { border-color: #3D5069; }

.exp-section-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: #133C65; margin-bottom: 12px;
}
.dark .exp-section-title { color: #93B8D8; }

.exp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.exp-field { display: flex; flex-direction: column; gap: 3px; }
.exp-field--full { grid-column: 1 / -1; }

.exp-field label { font-size: 11.5px; font-weight: 600; color: #7A90A0; }
.exp-field span { font-size: 13.5px; color: #1A2B3C; font-weight: 500; }
.dark .exp-field span { color: #E2E8F0; }

.exp-actions { display: flex; gap: 10px; justify-content: flex-end; }

.exp-empty {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: #B0C0D0; font-size: 13.5px; text-align: center;
}
.dark .exp-empty { background: #1D293D; border-color: #3D5069; }

/* ── Vacaciones ─────────────────────────── */
.vac-summary {
  display: flex; align-items: center; gap: 16px;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 16px 22px; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .vac-summary { background: #1D293D; border-color: #3D5069; }

.vac-saldo { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 0 16px; border-right: 1px solid #E8EEF4; }
.dark .vac-saldo { border-color: #3D5069; }
.vac-saldo:last-of-type { border-right: none; }
.vac-num { font-size: 28px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; line-height: 1; }
.dark .vac-num { color: #E2E8F0; }
.vac-lbl { font-size: 11.5px; color: #7A90A0; }
.vac-btn { margin-left: auto; flex-shrink: 0; }

/* ── Section header row ─────────────────── */
/* ── Export buttons ─────────────────────── */
.export-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.export-btn {
  width: 34px; height: 34px; background: none;
  border-radius: 7px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.export-btn--excel { color: #217346; border: 1.5px solid #C8E6C9; }
.export-btn--excel:hover { background: rgba(33,115,70,0.08); border-color: #217346; }
.export-btn--pdf { color: #C0392B; border: 1.5px solid #FFCDD2; }
.export-btn--pdf:hover { background: rgba(192,57,43,0.08); border-color: #C0392B; }

/* exp-detail header actions */
.exp-header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.section-header-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.section-subtitle { font-size: 15px; font-weight: 700; color: #133C65; }
.dark .section-subtitle { color: #E2E8F0; }

/* ── Coming soon ────────────────────────── */
.coming-soon-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 60px 24px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center;
}
.dark .coming-soon-card { background: #1D293D; border-color: #3D5069; }
.cs-icon {
  width: 56px; height: 56px; border-radius: 14px; background: rgba(19,60,101,0.08);
  display: flex; align-items: center; justify-content: center; color: #133C65;
}
.dark .cs-icon { background: rgba(147,184,216,0.1); color: #93B8D8; }
.cs-icon svg { width: 24px; height: 24px; }
.cs-title { font-size: 18px; font-weight: 700; color: #133C65; }
.dark .cs-title { color: #E2E8F0; }
.cs-desc { font-size: 13.5px; color: #7A90A0; max-width: 340px; }

/* ── Buttons ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }
.btn-primary--danger { background: #C0392B; }
.btn-primary--danger:hover:not(:disabled) { background: #9E2E22; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }

/* ── Modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.5);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px; padding: 30px;
  width: 100%; max-width: 640px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22); max-height: 90vh; overflow-y: auto;
}
.dark .modal-box { background: #1D293D; }
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 7px;
  background: #F4F6F8; border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }
.modal-title { font-size: 20px; font-weight: 700; color: #133C65; margin-bottom: 4px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 13.5px; color: #4A6070; margin-bottom: 20px; }

.modal-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: #7A90A0; border-bottom: 1px solid #F0F4F8; padding-bottom: 6px;
}
.dark .form-section-title { border-color: #3D5069; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 12.5px; font-weight: 600; color: #4A6070; }
.dark .form-field label { color: #94A3B8; }
.form-field input, .form-field select, .form-field textarea {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
  transition: border-color 0.15s;
}
.form-field textarea { height: auto; padding: 10px 12px; resize: vertical; }
.form-field input[type="file"] { padding: 6px 10px; height: auto; }
.dark .form-field input, .dark .form-field select, .dark .form-field textarea {
  background: #162033; border-color: #3D5069; color: #E2E8F0;
}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus {
  border-color: #133C65;
}
.req { color: #C0392B; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.checkbox-inline { flex-direction: row !important; align-items: center; gap: 6px; justify-content: flex-start; }
.checkbox-inline label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4A6070; }
.dark .checkbox-inline label { color: #94A3B8; }

/* ── Expediente en pestañas (modal) ───────── */
.modal-box--expediente { max-width: 880px; }
.vac-modal-tabs { display: flex; gap: 4px; margin: 8px 0 16px; }

.adjunto-actual {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 7px 10px; border: 1px solid #E8EEF4; border-radius: 7px; background: #F8FAFC; margin-bottom: 6px;
}
.dark .adjunto-actual { background: #162033; border-color: #3D5069; }
.adjunto-nombre { font-size: 12.5px; color: #133C65; cursor: pointer; text-decoration: underline; word-break: break-all; }
.dark .adjunto-nombre { color: #93B8D8; }
.adjunto-quitar {
  width: 20px; height: 20px; border-radius: 5px; border: none; background: none;
  color: #B8C4CE; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.adjunto-quitar:hover { color: #C0392B; background: rgba(192,57,43,0.1); }
.exp-modal-layout { display: grid; grid-template-columns: 190px 1fr; gap: 20px; margin-top: 8px; }
.exp-tab-list { display: flex; flex-direction: column; gap: 2px; }
.exp-tab-item {
  text-align: left; padding: 9px 12px; border-radius: 8px; border: none; background: none;
  font-size: 12.5px; font-weight: 600; color: #4A6070; cursor: pointer; transition: all 0.15s;
}
.exp-tab-item:hover { background: #F0F4F8; }
.dark .exp-tab-item { color: #94A3B8; }
.dark .exp-tab-item:hover { background: #243553; }
.exp-tab-item--active { background: #133C65; color: white; }
.dark .exp-tab-item--active { background: #2D5A8A; color: white; }
.exp-tab-item--disabled { opacity: 0.45; }
.exp-tab-content { min-width: 0; max-height: 60vh; overflow-y: auto; padding-right: 4px; }

.exp-subsection { display: flex; flex-direction: column; gap: 12px; }
.exp-subtitle { font-size: 12.5px; font-weight: 700; color: #133C65; margin: 0; }
.dark .exp-subtitle { color: #E2E8F0; }
.exp-hint { font-size: 12px; color: #7A90A0; margin: 0; }

.exp-mini-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.exp-mini-empty { font-size: 12.5px; color: #7A90A0; padding: 6px 0; }
.exp-mini-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 4px; border-bottom: 1px solid #F0F4F8; font-size: 13px; color: #1A2B3C;
}
.dark .exp-mini-item { border-color: #2A3B57; color: #E2E8F0; }
.exp-mini-item:last-child { border-bottom: none; }
.exp-mini-sub { font-size: 11.5px; color: #7A90A0; margin-top: 2px; }

@media (max-width: 700px) {
  .exp-modal-layout { grid-template-columns: 1fr; }
  .exp-tab-list { flex-direction: row; overflow-x: auto; }
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Documentos ─────────────────────────── */
.doc-filters { display: flex; gap: 10px; flex-wrap: wrap; }

.doc-groups { display: flex; flex-direction: column; gap: 20px; }

.doc-group-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.doc-group-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.doc-group-title { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .doc-group-title { color: #E2E8F0; }
.doc-group-count {
  font-size: 11px; font-weight: 600; color: #7A90A0;
  background: #F0F4F8; border-radius: 20px; padding: 2px 8px;
}
.dark .doc-group-count { background: #2D3F55; }

.doc-tipo {
  display: flex; align-items: center; gap: 6px;
  font-weight: 500; color: #1A2B3C;
}
.dark .doc-tipo { color: #E2E8F0; }

.doc-vence { font-size: 12.5px; color: #1A2B3C; }
.dark .doc-vence { color: #E2E8F0; }
.doc-vence-alert { font-size: 12.5px; font-weight: 700; color: #C47F0C; }
.doc-vence-na { font-size: 12.5px; color: #B0C0D0; }

.file-drop {
  border: 2px dashed #D4E4F4; border-radius: 10px;
  padding: 24px 20px; display: flex; flex-direction: column;
  align-items: center; gap: 8px; text-align: center; background: #F8FAFC;
  cursor: pointer; transition: border-color 0.15s;
}
.dark .file-drop { background: #162033; border-color: #3D5069; }
.file-drop:hover { border-color: #133C65; }
.file-drop p { font-size: 13.5px; color: #4A6070; margin: 0; }
.dark .file-drop p { color: #94A3B8; }
.file-drop small { font-size: 11.5px; color: #B0C0D0; }
.file-link { color: #133C65; font-weight: 600; cursor: pointer; text-decoration: underline; }
.dark .file-link { color: #93B8D8; }

/* ── Asistencia ─────────────────────────── */
.asist-summary {
  display: flex; gap: 0;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .asist-summary { background: #1D293D; border-color: #3D5069; }

.asist-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 12px; border-right: 1px solid #E8EEF4;
}
.dark .asist-stat { border-color: #3D5069; }
.asist-stat:last-child { border-right: none; }

.asist-num {
  font-size: 30px; font-weight: 800; color: #133C65;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.dark .asist-num { color: #E2E8F0; }
.asist-num--red    { color: #C0392B; }
.asist-num--yellow { color: #C47F0C; }
.asist-num--blue   { color: #1565C0; }
.asist-lbl { font-size: 12px; color: #7A90A0; font-weight: 500; }

.date-range { display: flex; align-items: center; gap: 6px; }
.date-sep { font-size: 13px; color: #7A90A0; }

.time-badge {
  display: inline-block; font-size: 13px; font-weight: 600;
  font-family: monospace; color: #133C65; letter-spacing: 0.5px;
}
.dark .time-badge { color: #93B8D8; }
.time-badge--pending { color: #B0C0D0; font-weight: 400; }

.font-mono { font-family: monospace; font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .font-mono { color: #E2E8F0; }
.text-muted { font-size: 13px; color: #B0C0D0; }
.text-muted-sm { font-size: 12.5px; color: #7A90A0; }

/* ── Capacitaciones ─────────────────────── */
.cap-summary {
  display: flex; gap: 0;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .cap-summary { background: #1D293D; border-color: #3D5069; }

.cap-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 12px; border-right: 1px solid #E8EEF4;
}
.dark .cap-stat { border-color: #3D5069; }
.cap-stat:last-child { border-right: none; }

.cap-num {
  font-size: 30px; font-weight: 800; color: #133C65;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.dark .cap-num { color: #E2E8F0; }
.cap-num--blue  { color: #1565C0; }
.cap-num--green { color: #1A9152; }
.cap-num--teal  { color: #00808C; }
.cap-lbl { font-size: 12px; color: #7A90A0; font-weight: 500; }

.cap-nombre { display: flex; flex-direction: column; gap: 2px; }
.cap-titulo { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .cap-titulo { color: #E2E8F0; }
.cap-depto { font-size: 11.5px; color: #7A90A0; }

.modalidad-badge {
  display: inline-block; font-size: 11.5px; font-weight: 600;
  padding: 3px 9px; border-radius: 20px;
}
.modalidad--virtual    { background: rgba(21,101,192,0.1); color: #1565C0; }
.modalidad--presencial { background: rgba(26,145,82,0.1);  color: #1A6B42; }
.modalidad--mixta      { background: rgba(123,63,160,0.1); color: #7B3FA0; }

.asistentes-cell { display: flex; flex-direction: column; align-items: center; }
.asistentes-num { font-size: 16px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; }
.dark .asistentes-num { color: #E2E8F0; }
.asistentes-lbl { font-size: 10px; color: #7A90A0; }

/* ── Evaluaciones ───────────────────────── */
.calificacion-cell { display: flex; align-items: baseline; gap: 2px; }
.calificacion-num {
  font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1;
}
.cal--good { color: #1A9152; }
.cal--mid  { color: #C47F0C; }
.cal--low  { color: #C0392B; }
.calificacion-max { font-size: 11.5px; color: #7A90A0; }

.eval-competencias { display: flex; flex-direction: column; gap: 10px; }
.comp-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.comp-label { font-size: 13.5px; color: #1A2B3C; font-weight: 500; }
.dark .comp-label { color: #E2E8F0; }
.comp-stars { display: flex; gap: 4px; }
.star-btn {
  background: none; border: none; cursor: pointer; padding: 0;
  transition: transform 0.1s;
}
.star-btn:hover { transform: scale(1.2); }
.star-btn:hover svg { stroke: #C47F0C; }

/* ── Formulario extras ──────────────────── */
.section-desc { font-size: 13px; color: #7A90A0; margin-top: 2px; }

.badge--blue-light { background: rgba(21,101,192,0.1); color: #1565C0; }
.dark .badge--blue-light { background: rgba(147,197,253,0.18); color: #93C5FD; }

.checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 0; }
.checkbox-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #1A2B3C; cursor: pointer;
}
.dark .checkbox-item { color: #E2E8F0; }
.checkbox-item input[type="checkbox"] { accent-color: #133C65; width: 15px; height: 15px; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 1200px) {
  .indicators-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1000px) {
  .indicators-grid { grid-template-columns: repeat(3, 1fr); }
  .exp-layout { grid-template-columns: 1fr; }
  .asist-summary, .cap-summary { flex-wrap: wrap; }
  .asist-stat, .cap-stat { border-right: none; border-bottom: 1px solid #E8EEF4; }
}
@media (max-width: 700px) {
  .indicators-grid { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .comp-item { flex-direction: column; align-items: flex-start; gap: 6px; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
  .data-card { overflow-x: auto; }
  .tab-list { overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
  .tab-list::-webkit-scrollbar { height: 0; }
  .modal-body, .modal-box { padding: 16px !important; }
}
</style>
