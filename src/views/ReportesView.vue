<template>
  <div class="module-page">

    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Reportes Gerenciales</h2>
        <p class="page-subtitle">Información estratégica para la toma de decisiones del Consejo de Administración</p>
      </div>
      <div class="header-actions">
        <select v-model="periodo" class="filter-select">
          <option value="mes">Junio 2026</option>
          <option value="q2">Q2 2026 (Abr–Jun)</option>
          <option value="anual">Anual 2026 (Ene–Jun)</option>
          <option value="2025">Año 2025</option>
        </select>
        <button class="btn-outline" @click="exportar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
      </div>
    </div>

    <!-- Pestañas -->
    <div class="tabs-wrap">
      <div class="tabs-nav">
        <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ 'tab-btn--active': activeTab === t.key }" @click="activeTab = t.key">
          <span v-html="t.icon"></span>{{ t.label }}
        </button>
      </div>
    </div>

    <!-- ═══════════════ TAB: INDICADORES CLAVE (KPIs) ═══════════════ -->
    <template v-if="activeTab === 'kpis'">

      <!-- Métricas principales -->
      <div class="kpi-row">
        <div class="kpi-card kpi-card--navy">
          <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <div>
            <div class="kpi-value">₡25.000.000</div>
            <div class="kpi-label">Ingresos del período</div>
            <div class="kpi-trend kpi-trend--up">↑ +8.2% vs mes anterior</div>
          </div>
        </div>
        <div class="kpi-card kpi-card--green">
          <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
          <div>
            <div class="kpi-value">₡7.000.000</div>
            <div class="kpi-label">Excedente neto</div>
            <div class="kpi-trend kpi-trend--up">↑ +5.1% vs mes anterior</div>
          </div>
        </div>
        <div class="kpi-card kpi-card--blue">
          <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
          <div>
            <div class="kpi-value">₡45.350.000</div>
            <div class="kpi-label">Saldo en bancos y caja</div>
            <div class="kpi-trend kpi-trend--up">↑ +₡1.2M vs mes anterior</div>
          </div>
        </div>
        <div class="kpi-card kpi-card--gold">
          <div class="kpi-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
          <div>
            <div class="kpi-value">₡124.350.000</div>
            <div class="kpi-label">Cartera de crédito</div>
            <div class="kpi-trend kpi-trend--up">↑ +₡2.5M vs mes anterior</div>
          </div>
        </div>
      </div>

      <!-- Semáforo de indicadores -->
      <div class="semaforo-section">
        <h3 class="section-title">Semáforo de gestión</h3>
        <div class="semaforo-grid">
          <div v-for="ind in semaforo" :key="ind.nombre" class="semaforo-card">
            <div class="semaforo-luz" :class="`semaforo-luz--${ind.color}`">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle v-if="ind.color === 'verde'" cx="12" cy="12" r="10"/>
                <path v-if="ind.color === 'verde'" d="M9 12l2 2 4-4"/>
                <path v-if="ind.color === 'amarillo'" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line v-if="ind.color === 'amarillo'" x1="12" y1="9" x2="12" y2="13"/>
                <line v-if="ind.color === 'amarillo'" x1="12" y1="17" x2="12.01" y2="17"/>
                <circle v-if="ind.color === 'rojo'" cx="12" cy="12" r="10"/>
                <line v-if="ind.color === 'rojo'" x1="15" y1="9" x2="9" y2="15"/>
                <line v-if="ind.color === 'rojo'" x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div class="semaforo-info">
              <div class="semaforo-nombre">{{ ind.nombre }}</div>
              <div class="semaforo-valor">{{ ind.valor }}</div>
              <div class="semaforo-meta">Meta: {{ ind.meta }}</div>
            </div>
            <div class="semaforo-estado" :class="`semaforo-estado--${ind.color}`">{{ ind.estado }}</div>
          </div>
        </div>
      </div>

      <!-- Comparativo mensual (barras CSS) -->
      <div class="grafica-section">
        <div class="data-card grafica-card">
          <div class="card-header-row" style="padding:16px 20px 0">
            <h3 class="card-title">Ingresos vs Gastos — últimos 6 meses</h3>
            <div class="grafica-leyenda">
              <span class="legend-dot legend-dot--navy"></span><span>Ingresos</span>
              <span class="legend-dot legend-dot--red"></span><span>Gastos</span>
              <span class="legend-dot legend-dot--green"></span><span>Excedente</span>
            </div>
          </div>
          <div class="barras-wrap">
            <div v-for="mes in comparativoMeses" :key="mes.mes" class="barras-grupo">
              <div class="barras-col">
                <div class="barra-tooltip">{{ mes.ingresos }}</div>
                <div class="barra barra--navy" :style="{ height: (mes.ingresosVal / 30000000 * 140) + 'px' }"></div>
                <div class="barra barra--red"  :style="{ height: (mes.gastosVal  / 30000000 * 140) + 'px' }"></div>
                <div class="barra barra--green":style="{ height: (mes.excedVal   / 30000000 * 140) + 'px' }"></div>
              </div>
              <div class="barras-label">{{ mes.mes }}</div>
            </div>
          </div>
        </div>

        <div class="data-card grafica-card">
          <div class="card-header-row" style="padding:16px 20px 12px">
            <h3 class="card-title">Composición de ingresos</h3>
          </div>
          <div class="composicion-list">
            <div v-for="comp in composicionIngresos" :key="comp.concepto" class="composicion-item">
              <div class="comp-header">
                <span class="comp-concepto">{{ comp.concepto }}</span>
                <span class="comp-pct fw-600">{{ comp.pct }}%</span>
              </div>
              <div class="comp-bar-bg">
                <div class="comp-bar-fill" :style="{ width: comp.pct + '%', background: comp.color }"></div>
              </div>
              <div class="comp-monto td-muted">{{ comp.monto }}</div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ═══════════════ TAB: RESUMEN FINANCIERO ═══════════════ -->
    <template v-if="activeTab === 'financiero'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--green"><div><div class="kpi-value">₡25.000.000</div><div class="kpi-label">Ingresos del período</div></div></div>
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">₡18.000.000</div><div class="kpi-label">Gastos del período</div></div></div>
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">₡7.000.000</div><div class="kpi-label">Excedente neto (28%)</div></div></div>
        <div class="kpi-card kpi-card--blue"><div><div class="kpi-value">₡45.350.000</div><div class="kpi-label">Saldo total (Caja + Bancos)</div></div></div>
      </div>

      <div class="dos-col">
        <!-- Desglose ingresos -->
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Desglose de ingresos</h3><span class="badge badge--green">↑ +8.2%</span></div>
          <table class="data-table">
            <thead><tr><th>Concepto</th><th class="td-right">Monto</th><th class="td-right">% del total</th><th>Variación</th></tr></thead>
            <tbody>
              <tr v-for="ing in desgloseIngresos" :key="ing.concepto">
                <td class="fw-600">{{ ing.concepto }}</td>
                <td class="td-right">{{ ing.monto }}</td>
                <td class="td-right">
                  <div class="mini-bar-wrap">
                    <div class="mini-bar-bg"><div class="mini-bar-fill mini-bar--green" :style="{ width: ing.pct + '%' }"></div></div>
                    <span>{{ ing.pct }}%</span>
                  </div>
                </td>
                <td><span :class="['badge', ing.var.startsWith('+') ? 'badge--green' : 'badge--red']">{{ ing.var }}</span></td>
              </tr>
            </tbody>
            <tfoot><tr class="tfoot-total"><td><strong>TOTAL</strong></td><td class="td-right"><strong>₡25.000.000</strong></td><td class="td-right"><strong>100%</strong></td><td></td></tr></tfoot>
          </table>
        </div>

        <!-- Desglose gastos -->
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Desglose de gastos</h3><span class="badge badge--red">↑ +3.1%</span></div>
          <table class="data-table">
            <thead><tr><th>Concepto</th><th class="td-right">Monto</th><th class="td-right">% del total</th><th>Variación</th></tr></thead>
            <tbody>
              <tr v-for="gas in desgloseGastos" :key="gas.concepto">
                <td class="fw-600">{{ gas.concepto }}</td>
                <td class="td-right">{{ gas.monto }}</td>
                <td class="td-right">
                  <div class="mini-bar-wrap">
                    <div class="mini-bar-bg"><div class="mini-bar-fill mini-bar--red" :style="{ width: gas.pct + '%' }"></div></div>
                    <span>{{ gas.pct }}%</span>
                  </div>
                </td>
                <td><span :class="['badge', gas.var.startsWith('+') ? 'badge--red' : 'badge--green']">{{ gas.var }}</span></td>
              </tr>
            </tbody>
            <tfoot><tr class="tfoot-total"><td><strong>TOTAL</strong></td><td class="td-right"><strong>₡18.000.000</strong></td><td class="td-right"><strong>100%</strong></td><td></td></tr></tfoot>
          </table>
        </div>
      </div>

      <!-- Flujo de efectivo -->
      <div class="data-card">
        <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Flujo de efectivo — últimos 6 meses</h3></div>
        <table class="data-table">
          <thead><tr><th>Mes</th><th class="td-right">Saldo inicial</th><th class="td-right">Entradas</th><th class="td-right">Salidas</th><th class="td-right">Saldo final</th><th>Variación</th></tr></thead>
          <tbody>
            <tr v-for="f in flujoEfectivo" :key="f.mes">
              <td class="fw-600">{{ f.mes }}</td>
              <td class="td-right td-muted">{{ f.inicial }}</td>
              <td class="td-right txt-green">{{ f.entradas }}</td>
              <td class="td-right txt-red">{{ f.salidas }}</td>
              <td class="td-right fw-600">{{ f.final }}</td>
              <td><span :class="['badge', f.var.startsWith('+') ? 'badge--green' : 'badge--red']">{{ f.var }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══════════════ TAB: CARTERA DE CRÉDITO ═══════════════ -->
    <template v-if="activeTab === 'cartera'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">₡124.350.000</div><div class="kpi-label">Cartera total activa</div></div></div>
        <div class="kpi-card kpi-card--yellow"><div><div class="kpi-value">₡18.200.000</div><div class="kpi-label">Por vencer (30 días)</div></div></div>
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">₡8.960.000</div><div class="kpi-label">Cartera en mora</div></div></div>
        <div class="kpi-card kpi-card--green"><div><div class="kpi-value">92.8%</div><div class="kpi-label">Recuperación mensual</div></div></div>
      </div>

      <!-- Concentración por tipo (barras horizontales) -->
      <div class="dos-col">
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 12px"><h3 class="card-title">Concentración por tipo de crédito</h3></div>
          <div class="concentracion-list">
            <div v-for="tipo in concentracionCartera" :key="tipo.nombre" class="conc-item">
              <div class="conc-header">
                <div>
                  <span class="conc-nombre">{{ tipo.nombre }}</span>
                  <span class="td-muted" style="margin-left:6px;font-size:11px">{{ tipo.creditos }} créditos</span>
                </div>
                <span class="fw-600">{{ tipo.saldo }}</span>
              </div>
              <div class="conc-bar-bg">
                <div class="conc-bar-fill" :style="{ width: tipo.pct + '%', background: tipo.color }"></div>
              </div>
              <div class="conc-footer">
                <span class="td-muted">{{ tipo.pct }}% de la cartera</span>
                <span :class="tipo.mora > 0 ? 'txt-red' : 'td-muted'" style="font-size:11px">Mora: {{ tipo.mora }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Créditos por vencer — próximos 30 días</h3></div>
          <table class="data-table">
            <thead><tr><th>Días para vencer</th><th>Créditos</th><th class="td-right">Monto</th><th>Riesgo</th></tr></thead>
            <tbody>
              <tr><td class="fw-600">1 – 7 días</td><td>8</td><td class="td-right fw-600 txt-red">₡4.200.000</td><td><span class="badge badge--red">Urgente</span></td></tr>
              <tr><td class="fw-600">8 – 15 días</td><td>14</td><td class="td-right fw-600 txt-yellow">₡7.100.000</td><td><span class="badge badge--yellow">Próximo</span></td></tr>
              <tr><td class="fw-600">16 – 30 días</td><td>22</td><td class="td-right fw-600">₡6.900.000</td><td><span class="badge badge--green">Normal</span></td></tr>
            </tbody>
            <tfoot><tr class="tfoot-total"><td><strong>Total</strong></td><td><strong>44</strong></td><td class="td-right"><strong>₡18.200.000</strong></td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══════════════ TAB: MOROSIDAD ═══════════════ -->
    <template v-if="activeTab === 'morosidad'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">₡8.960.000</div><div class="kpi-label">Monto total en mora</div></div></div>
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">9</div><div class="kpi-label">Créditos morosos</div></div></div>
        <div class="kpi-card kpi-card--yellow"><div><div class="kpi-value">7.2%</div><div class="kpi-label">Índice de morosidad</div></div></div>
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">1</div><div class="kpi-label">Crédito nivel crítico (+90d)</div></div></div>
      </div>

      <!-- Clasificación visual -->
      <div class="mora-tabla-wrap">
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Clasificación por días de atraso</h3></div>
          <table class="data-table">
            <thead><tr><th>Clasificación</th><th>Días de atraso</th><th class="td-right">N° créditos</th><th class="td-right">Monto en mora</th><th class="td-right">% del total mora</th><th>Barra</th></tr></thead>
            <tbody>
              <tr v-for="cl in clasificacionMoraReporte" :key="cl.label">
                <td><span :class="['badge', cl.badge]">{{ cl.label }}</span></td>
                <td class="td-muted">{{ cl.dias }}</td>
                <td class="td-right fw-600">{{ cl.creditos }}</td>
                <td class="td-right fw-600" :class="cl.creditos > 0 ? 'txt-red' : ''">{{ cl.monto }}</td>
                <td class="td-right">{{ cl.pct }}%</td>
                <td>
                  <div class="mini-bar-bg" style="width:120px">
                    <div class="mini-bar-fill" :class="cl.barClass" :style="{ width: cl.pct + '%' }"></div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot><tr class="tfoot-total"><td><strong>Total</strong></td><td></td><td class="td-right"><strong>9</strong></td><td class="td-right txt-red"><strong>₡8.960.000</strong></td><td class="td-right"><strong>100%</strong></td><td></td></tr></tfoot>
          </table>
        </div>
      </div>

      <!-- Evolución de la mora -->
      <div class="data-card">
        <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Evolución del índice de morosidad</h3></div>
        <table class="data-table">
          <thead><tr><th>Mes</th><th class="td-right">Cartera total</th><th class="td-right">Cartera en mora</th><th class="td-right">Índice</th><th>Tendencia</th><th>Evaluación</th></tr></thead>
          <tbody>
            <tr v-for="ev in evolucionMora" :key="ev.mes">
              <td class="fw-600">{{ ev.mes }}</td>
              <td class="td-right td-muted">{{ ev.cartera }}</td>
              <td class="td-right txt-red">{{ ev.mora }}</td>
              <td class="td-right fw-600" :class="parseFloat(ev.indice) > 7 ? 'txt-red' : parseFloat(ev.indice) > 5 ? 'txt-yellow' : 'txt-green'">{{ ev.indice }}%</td>
              <td><span :class="['tendencia', `tendencia--${ev.tend}`]">
                <svg v-if="ev.tend==='sube'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                <svg v-else-if="ev.tend==='baja'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {{ ev.tend === 'sube' ? 'Aumenta' : ev.tend === 'baja' ? 'Mejora' : 'Estable' }}
              </span></td>
              <td><span :class="['badge', parseFloat(ev.indice) > 7 ? 'badge--red' : parseFloat(ev.indice) > 5 ? 'badge--yellow' : 'badge--green']">{{ parseFloat(ev.indice) > 7 ? 'Crítico' : parseFloat(ev.indice) > 5 ? 'Alerta' : 'Normal' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ═══════════════ TAB: ASOCIADOS ═══════════════ -->
    <template v-if="activeTab === 'asociados'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">420</div><div class="kpi-label">Asociados activos</div></div></div>
        <div class="kpi-card kpi-card--green"><div><div class="kpi-value">12</div><div class="kpi-label">Nuevos este mes</div></div></div>
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">3</div><div class="kpi-label">Retirados este mes</div></div></div>
        <div class="kpi-card kpi-card--blue"><div><div class="kpi-value">+9</div><div class="kpi-label">Crecimiento neto</div></div></div>
      </div>

      <div class="dos-col">
        <!-- Evolución -->
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Evolución de asociados — 2026</h3></div>
          <table class="data-table">
            <thead><tr><th>Mes</th><th class="td-right">Activos</th><th class="td-right txt-green">Ingresos</th><th class="td-right txt-red">Retiros</th><th class="td-right">Neto</th></tr></thead>
            <tbody>
              <tr v-for="ev in evolucionAsociados" :key="ev.mes">
                <td class="fw-600">{{ ev.mes }}</td>
                <td class="td-right">{{ ev.activos }}</td>
                <td class="td-right txt-green">+{{ ev.ingresos }}</td>
                <td class="td-right txt-red">-{{ ev.retiros }}</td>
                <td class="td-right fw-600" :class="ev.neto > 0 ? 'txt-green' : 'txt-red'">{{ ev.neto > 0 ? '+' : '' }}{{ ev.neto }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Distribución por género y estado -->
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 12px"><h3 class="card-title">Perfil de asociados</h3></div>
          <div class="perfil-list">
            <div class="perfil-seccion">
              <div class="perfil-titulo">Por género</div>
              <div v-for="p in perfilAsociados.genero" :key="p.label" class="perfil-item">
                <span class="perfil-label">{{ p.label }}</span>
                <div class="mini-bar-bg" style="flex:1"><div class="mini-bar-fill" :style="{ width: p.pct + '%', background: p.color }"></div></div>
                <span class="fw-600" style="width:60px;text-align:right">{{ p.valor }} ({{ p.pct }}%)</span>
              </div>
            </div>
            <div class="perfil-seccion">
              <div class="perfil-titulo">Por antigüedad</div>
              <div v-for="p in perfilAsociados.antiguedad" :key="p.label" class="perfil-item">
                <span class="perfil-label">{{ p.label }}</span>
                <div class="mini-bar-bg" style="flex:1"><div class="mini-bar-fill mini-bar--navy" :style="{ width: p.pct + '%' }"></div></div>
                <span class="fw-600" style="width:60px;text-align:right">{{ p.valor }} ({{ p.pct }}%)</span>
              </div>
            </div>
            <div class="perfil-seccion">
              <div class="perfil-titulo">Por estado</div>
              <div v-for="p in perfilAsociados.estado" :key="p.label" class="perfil-item">
                <span class="perfil-label">{{ p.label }}</span>
                <div class="mini-bar-bg" style="flex:1"><div class="mini-bar-fill" :style="{ width: p.pct + '%', background: p.color }"></div></div>
                <span class="fw-600" style="width:60px;text-align:right">{{ p.valor }} ({{ p.pct }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════ TAB: APORTACIONES ═══════════════ -->
    <template v-if="activeTab === 'aportaciones'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">₡85.000.000</div><div class="kpi-label">Capital social total</div></div></div>
        <div class="kpi-card kpi-card--green"><div><div class="kpi-value">₡4.500.000</div><div class="kpi-label">Aportaciones del mes</div></div></div>
        <div class="kpi-card kpi-card--blue"><div><div class="kpi-value">+3.0%</div><div class="kpi-label">Crecimiento mensual</div></div></div>
        <div class="kpi-card kpi-card--gold"><div><div class="kpi-value">₡202.381</div><div class="kpi-label">Promedio por asociado</div></div></div>
      </div>

      <div class="dos-col">
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Evolución del capital social — 2026</h3></div>
          <table class="data-table">
            <thead><tr><th>Mes</th><th class="td-right">Capital acumulado</th><th class="td-right">Aportaciones</th><th class="td-right">Retiros</th><th class="td-right">Variación</th></tr></thead>
            <tbody>
              <tr v-for="ap in evolucionAportaciones" :key="ap.mes">
                <td class="fw-600">{{ ap.mes }}</td>
                <td class="td-right fw-600">{{ ap.capital }}</td>
                <td class="td-right txt-green">+{{ ap.aportaciones }}</td>
                <td class="td-right txt-red">-{{ ap.retiros }}</td>
                <td class="td-right"><span :class="['badge', ap.var.startsWith('+') ? 'badge--green' : 'badge--red']">{{ ap.var }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 12px"><h3 class="card-title">Top 10 aportantes del mes</h3></div>
          <table class="data-table">
            <thead><tr><th>#</th><th>Asociado</th><th class="td-right">Aportación</th><th class="td-right">Acumulado</th></tr></thead>
            <tbody>
              <tr v-for="(ap, i) in topAportantes" :key="ap.nombre">
                <td class="td-muted">{{ i + 1 }}</td>
                <td>{{ ap.nombre }}</td>
                <td class="td-right txt-green fw-600">{{ ap.aportacion }}</td>
                <td class="td-right td-muted">{{ ap.acumulado }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══════════════ TAB: RIESGOS ═══════════════ -->
    <template v-if="activeTab === 'riesgos'">
      <div class="kpi-row">
        <div class="kpi-card kpi-card--red"><div><div class="kpi-value">3</div><div class="kpi-label">Riesgos críticos</div></div></div>
        <div class="kpi-card kpi-card--yellow"><div><div class="kpi-value">5</div><div class="kpi-label">Incidentes del mes</div></div></div>
        <div class="kpi-card kpi-card--orange"><div><div class="kpi-value">2</div><div class="kpi-label">Planes de acción vencidos</div></div></div>
        <div class="kpi-card kpi-card--navy"><div><div class="kpi-value">8</div><div class="kpi-label">Riesgos identificados</div></div></div>
      </div>

      <!-- Resumen de riesgos por nivel -->
      <div class="dos-col">
        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Riesgos por nivel y categoría</h3></div>
          <table class="data-table">
            <thead><tr><th>Categoría</th><th class="td-right">Total</th><th class="td-right">Crítico</th><th class="td-right">Alto</th><th class="td-right">Moderado</th><th class="td-right">Bajo</th></tr></thead>
            <tbody>
              <tr v-for="rc in riesgosCategorias" :key="rc.cat">
                <td class="fw-600">{{ rc.cat }}</td>
                <td class="td-right">{{ rc.total }}</td>
                <td class="td-right" :class="rc.critico > 0 ? 'txt-red fw-600' : 'td-muted'">{{ rc.critico }}</td>
                <td class="td-right" :class="rc.alto > 0 ? 'txt-yellow fw-600' : 'td-muted'">{{ rc.alto }}</td>
                <td class="td-right td-muted">{{ rc.moderado }}</td>
                <td class="td-right td-muted">{{ rc.bajo }}</td>
              </tr>
            </tbody>
            <tfoot><tr class="tfoot-total"><td><strong>Total</strong></td><td class="td-right"><strong>8</strong></td><td class="td-right txt-red"><strong>1</strong></td><td class="td-right txt-yellow"><strong>2</strong></td><td class="td-right"><strong>4</strong></td><td class="td-right"><strong>1</strong></td></tr></tfoot>
          </table>
        </div>

        <div class="data-card">
          <div class="card-header-row" style="padding:14px 16px 0"><h3 class="card-title">Planes de acción — estado</h3></div>
          <table class="data-table">
            <thead><tr><th>Riesgo</th><th>Acción</th><th>Progreso</th><th>Estado</th></tr></thead>
            <tbody>
              <tr v-for="p in planesRiesgo" :key="p.riesgo">
                <td><span class="badge badge--blue">{{ p.riesgo }}</span></td>
                <td style="font-size:12px">{{ p.accion }}</td>
                <td>
                  <div class="prog-wrap">
                    <div class="prog-bg"><div class="prog-fill" :class="p.estado === 'Vencido' ? 'prog--red' : p.estado === 'Completado' ? 'prog--green' : 'prog--blue'" :style="{ width: p.prog + '%' }"></div></div>
                    <span class="prog-pct">{{ p.prog }}%</span>
                  </div>
                </td>
                <td><span :class="['badge', p.estado === 'Completado' ? 'badge--green' : p.estado === 'Vencido' ? 'badge--red' : p.estado === 'En progreso' ? 'badge--blue' : 'badge--yellow']">{{ p.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ═══════════════ TAB: REPORTES PERSONALIZADOS ═══════════════ -->
    <template v-if="activeTab === 'personalizados'">
      <div class="personalizado-layout">

        <!-- Constructor -->
        <div class="constructor-card">
          <h3 class="constructor-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Configurar reporte personalizado
          </h3>

          <div class="constructor-form">
            <div class="cform-group">
              <label>Módulo / área</label>
              <select v-model="customForm.modulo" class="filter-select full-width">
                <option>Finanzas</option><option>Créditos</option><option>Morosidad</option>
                <option>Asociados</option><option>Aportaciones</option><option>Personal</option>
                <option>Riesgos</option><option>Asambleas</option>
              </select>
            </div>
            <div class="cform-row">
              <div class="cform-group">
                <label>Fecha inicio</label>
                <DatePicker v-model="customForm.fechaInicio" input-class="filter-select full-width" />
              </div>
              <div class="cform-group">
                <label>Fecha fin</label>
                <DatePicker v-model="customForm.fechaFin" input-class="filter-select full-width" />
              </div>
            </div>
            <div class="cform-group">
              <label>Filtro adicional</label>
              <select class="filter-select full-width">
                <option>Sin filtro</option><option>Por tipo de crédito</option><option>Por área administrativa</option><option>Por asociado</option><option>Por estado</option>
              </select>
            </div>
            <div class="cform-group">
              <label>Columnas a incluir</label>
              <div class="checkboxes-grid">
                <label v-for="col in columnasDisp" :key="col" class="checkbox-item">
                  <input type="checkbox" :value="col" v-model="customForm.columnas" />
                  {{ col }}
                </label>
              </div>
            </div>
            <div class="cform-group">
              <label>Formato de exportación</label>
              <div class="radio-group">
                <label v-for="fmt in ['PDF','Excel','CSV']" :key="fmt" class="radio-item">
                  <input type="radio" :value="fmt" v-model="customForm.formato" /> {{ fmt }}
                </label>
              </div>
            </div>
            <button class="btn-primary btn-block">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Generar reporte
            </button>
          </div>
        </div>

        <!-- Reportes predefinidos -->
        <div class="predefinidos">
          <h3 class="constructor-title" style="margin-bottom:14px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Reportes predefinidos
          </h3>
          <div class="predefinidos-list">
            <div v-for="r in reportesPredefinidos" :key="r.nombre" class="predef-item">
              <div class="predef-icon" :style="{ background: r.bg, color: r.color }">
                <span v-html="r.icon"></span>
              </div>
              <div class="predef-body">
                <div class="predef-nombre">{{ r.nombre }}</div>
                <div class="predef-desc">{{ r.desc }}</div>
              </div>
              <button class="btn-outline btn-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from '../components/DatePicker.vue'

const activeTab = ref('kpis')
const periodo   = ref('mes')

function exportar() { /* placeholder */ }

const tabs = [
  { key: 'kpis',          label: 'Indicadores clave', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  { key: 'financiero',    label: 'Financiero',         icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
  { key: 'cartera',       label: 'Cartera',            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>` },
  { key: 'morosidad',     label: 'Morosidad',          icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
  { key: 'asociados',     label: 'Asociados',          icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>` },
  { key: 'aportaciones',  label: 'Aportaciones',       icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { key: 'riesgos',       label: 'Riesgos',            icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { key: 'personalizados',label: 'Personalizados',     icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09"/></svg>` },
]

const semaforo = [
  { nombre: 'Liquidez',               valor: '2.48x',  meta: '>1.5x',  estado: 'Buena',     color: 'verde'    },
  { nombre: 'Morosidad',              valor: '7.2%',   meta: '<5%',    estado: 'Alerta',    color: 'amarillo' },
  { nombre: 'Rentabilidad',           valor: '28%',    meta: '>20%',   estado: 'Positiva',  color: 'verde'    },
  { nombre: 'Crecimiento asociados',  valor: '+2.2%',  meta: '>1%/mes',estado: 'Favorable', color: 'verde'    },
  { nombre: 'Recuperación cartera',   valor: '92.8%',  meta: '>90%',   estado: 'Cumplida',  color: 'verde'    },
  { nombre: 'Cobertura riesgos',      valor: '62.5%',  meta: '>80%',   estado: 'En proceso',color: 'amarillo' },
]

const comparativoMeses = [
  { mes: 'Ene', ingresos: '₡23.1M', ingresosVal: 23100000, gastosVal: 17200000, excedVal: 5900000 },
  { mes: 'Feb', ingresos: '₡22.4M', ingresosVal: 22400000, gastosVal: 17000000, excedVal: 5400000 },
  { mes: 'Mar', ingresos: '₡24.0M', ingresosVal: 24000000, gastosVal: 17500000, excedVal: 6500000 },
  { mes: 'Abr', ingresos: '₡23.6M', ingresosVal: 23600000, gastosVal: 17800000, excedVal: 5800000 },
  { mes: 'May', ingresos: '₡23.1M', ingresosVal: 23100000, gastosVal: 17400000, excedVal: 5700000 },
  { mes: 'Jun', ingresos: '₡25.0M', ingresosVal: 25000000, gastosVal: 18000000, excedVal: 7000000 },
]

const composicionIngresos = [
  { concepto: 'Aportaciones de asociados', pct: 72, monto: '₡18.000.000', color: '#133C65' },
  { concepto: 'Cuotas administrativas',    pct: 12, monto: '₡3.000.000',  color: '#1B5490' },
  { concepto: 'Intereses cobrados',        pct:  8, monto: '₡2.000.000',  color: '#1A9152' },
  { concepto: 'Venta de servicios',        pct:  6, monto: '₡1.500.000',  color: '#C47F0C' },
  { concepto: 'Otros',                     pct:  2, monto: '₡500.000',    color: '#7A90A0' },
]

const desgloseIngresos = [
  { concepto: 'Aportaciones de asociados', monto: '₡18.000.000', pct: 72, var: '+6.5%' },
  { concepto: 'Cuotas administrativas',    monto: '₡3.000.000',  pct: 12, var: '+2.1%' },
  { concepto: 'Intereses cobrados',        monto: '₡2.000.000',  pct:  8, var: '+12.4%'},
  { concepto: 'Venta de servicios',        monto: '₡1.500.000',  pct:  6, var: '+15.0%'},
  { concepto: 'Otros ingresos',            monto: '₡500.000',    pct:  2, var: '-10.0%'},
]

const desgloseGastos = [
  { concepto: 'Salarios y cargas sociales',monto: '₡10.000.000', pct: 55, var: '+3.0%' },
  { concepto: 'Alquiler de oficinas',      monto: '₡2.400.000',  pct: 13, var: '0.0%'  },
  { concepto: 'Servicios públicos',        monto: '₡1.800.000',  pct: 10, var: '+5.0%' },
  { concepto: 'Papelería y suministros',   monto: '₡800.000',    pct:  4, var: '-8.0%' },
  { concepto: 'Proveedores y servicios',   monto: '₡3.000.000',  pct: 17, var: '+7.0%' },
]

const flujoEfectivo = [
  { mes: 'Enero',   inicial: '₡38.200.000', entradas: '₡23.100.000', salidas: '₡17.200.000', final: '₡44.100.000', var: '+₡5.9M' },
  { mes: 'Febrero', inicial: '₡44.100.000', entradas: '₡22.400.000', salidas: '₡17.000.000', final: '₡49.500.000', var: '+₡5.4M' },
  { mes: 'Marzo',   inicial: '₡49.500.000', entradas: '₡24.000.000', salidas: '₡17.500.000', final: '₡56.000.000', var: '+₡6.5M' },
  { mes: 'Abril',   inicial: '₡56.000.000', entradas: '₡23.600.000', salidas: '₡17.800.000', final: '₡61.800.000', var: '+₡5.8M' },
  { mes: 'Mayo',    inicial: '₡61.800.000', entradas: '₡23.100.000', salidas: '₡17.400.000', final: '₡67.500.000', var: '+₡5.7M' },
  { mes: 'Junio',   inicial: '₡67.500.000', entradas: '₡25.000.000', salidas: '₡18.000.000', final: '₡74.500.000', var: '+₡7.0M' },
]

const concentracionCartera = [
  { nombre: 'Personal',   creditos: 42, saldo: '₡38.400.000',  pct: 31, mora: 11.9, color: '#133C65' },
  { nombre: 'Vivienda',   creditos: 12, saldo: '₡72.400.000',  pct: 58, mora: 8.3,  color: '#1B5490' },
  { nombre: 'Educación',  creditos: 15, saldo: '₡6.800.000',   pct:  5, mora: 6.7,  color: '#1A9152' },
  { nombre: 'Emergencia', creditos: 18, saldo: '₡6.750.000',   pct:  6, mora: 11.1, color: '#C47F0C' },
]

const clasificacionMoraReporte = [
  { label: 'Temprana', dias: '1–30 días',  creditos: 2, monto: '₡149.000',   pct: 1.7,  badge: 'badge--yellow', barClass: 'mini-bar--yellow' },
  { label: 'Media',    dias: '31–60 días', creditos: 2, monto: '₡508.000',   pct: 5.7,  badge: 'badge--yellow', barClass: 'mini-bar--yellow' },
  { label: 'Alta',     dias: '61–90 días', creditos: 4, monto: '₡7.523.000', pct: 83.9, badge: 'badge--red',    barClass: 'mini-bar--red'    },
  { label: 'Crítica',  dias: '+90 días',   creditos: 1, monto: '₡780.000',   pct: 8.7,  badge: 'badge--red',    barClass: 'mini-bar--red'    },
]

const evolucionMora = [
  { mes: 'Enero',   cartera: '₡118.000.000', mora: '₡4.720.000', indice: '4.0', tend: 'estable' },
  { mes: 'Febrero', cartera: '₡119.500.000', mora: '₡5.378.000', indice: '4.5', tend: 'sube'    },
  { mes: 'Marzo',   cartera: '₡120.800.000', mora: '₡5.436.000', indice: '4.5', tend: 'estable' },
  { mes: 'Abril',   cartera: '₡121.500.000', mora: '₡6.682.000', indice: '5.5', tend: 'sube'    },
  { mes: 'Mayo',    cartera: '₡122.900.000', mora: '₡7.374.000', indice: '6.0', tend: 'sube'    },
  { mes: 'Junio',   cartera: '₡124.350.000', mora: '₡8.960.000', indice: '7.2', tend: 'sube'    },
]

const evolucionAsociados = [
  { mes: 'Enero',   activos: 395, ingresos: 8,  retiros: 2, neto: 6  },
  { mes: 'Febrero', activos: 400, ingresos: 7,  retiros: 2, neto: 5  },
  { mes: 'Marzo',   activos: 403, ingresos: 5,  retiros: 2, neto: 3  },
  { mes: 'Abril',   activos: 407, ingresos: 6,  retiros: 2, neto: 4  },
  { mes: 'Mayo',    activos: 411, ingresos: 7,  retiros: 3, neto: 4  },
  { mes: 'Junio',   activos: 420, ingresos: 12, retiros: 3, neto: 9  },
]

const perfilAsociados = {
  genero: [
    { label: 'Masculino', valor: 238, pct: 57, color: '#133C65' },
    { label: 'Femenino',  valor: 176, pct: 42, color: '#1A9152' },
    { label: 'No indica', valor:   6, pct:  1, color: '#7A90A0' },
  ],
  antiguedad: [
    { label: '0–1 año',  valor:  62, pct: 15 },
    { label: '1–3 años', valor:  84, pct: 20 },
    { label: '3–5 años', valor: 126, pct: 30 },
    { label: '+5 años',  valor: 148, pct: 35 },
  ],
  estado: [
    { label: 'Activos',    valor: 420, pct: 94, color: '#1A9152' },
    { label: 'Suspendidos',valor:  18, pct:  4, color: '#F59E0B' },
    { label: 'Retirados',  valor:   9, pct:  2, color: '#EF4444' },
  ],
}

const evolucionAportaciones = [
  { mes: 'Enero',   capital: '₡73.500.000', aportaciones: '₡4.200.000', retiros: '₡80.000',  var: '+2.8%' },
  { mes: 'Febrero', capital: '₡76.000.000', aportaciones: '₡4.100.000', retiros: '₡75.000',  var: '+2.6%' },
  { mes: 'Marzo',   capital: '₡78.500.000', aportaciones: '₡4.300.000', retiros: '₡90.000',  var: '+3.3%' },
  { mes: 'Abril',   capital: '₡80.200.000', aportaciones: '₡4.000.000', retiros: '₡120.000', var: '+3.1%' },
  { mes: 'Mayo',    capital: '₡82.550.000', aportaciones: '₡4.250.000', retiros: '₡80.000',  var: '+3.2%' },
  { mes: 'Junio',   capital: '₡85.000.000', aportaciones: '₡4.500.000', retiros: '₡75.000',  var: '+3.0%' },
]

const topAportantes = [
  { nombre: 'Carlos Mora Jiménez',   aportacion: '₡150.000', acumulado: '₡2.400.000' },
  { nombre: 'María Campos Blanco',   aportacion: '₡120.000', acumulado: '₡1.800.000' },
  { nombre: 'Ana Solís Rojas',       aportacion: '₡100.000', acumulado: '₡1.500.000' },
  { nombre: 'Luis Ureña Vargas',     aportacion: '₡100.000', acumulado: '₡2.100.000' },
  { nombre: 'Jorge Sandoval Cruz',   aportacion: '₡90.000',  acumulado: '₡1.200.000' },
  { nombre: 'Patricia Flores Mora',  aportacion: '₡85.000',  acumulado: '₡980.000'   },
  { nombre: 'Roberto Vega Mora',     aportacion: '₡80.000',  acumulado: '₡1.600.000' },
  { nombre: 'Silvia Monge López',    aportacion: '₡75.000',  acumulado: '₡900.000'   },
  { nombre: 'Fernando Arce Mena',    aportacion: '₡70.000',  acumulado: '₡840.000'   },
  { nombre: 'Ramón Quesada Arce',    aportacion: '₡65.000',  acumulado: '₡780.000'   },
]

const riesgosCategorias = [
  { cat: 'Crédito',      total: 1, critico: 1, alto: 0, moderado: 0, bajo: 0 },
  { cat: 'Tecnológico',  total: 2, critico: 0, alto: 0, moderado: 2, bajo: 0 },
  { cat: 'Operativo',    total: 2, critico: 0, alto: 0, moderado: 1, bajo: 1 },
  { cat: 'Financiero',   total: 1, critico: 0, alto: 1, moderado: 0, bajo: 0 },
  { cat: 'Cumplimiento', total: 1, critico: 0, alto: 1, moderado: 0, bajo: 0 },
  { cat: 'RRHH',         total: 1, critico: 0, alto: 0, moderado: 1, bajo: 0 },
]

const planesRiesgo = [
  { riesgo: 'R001', accion: 'Recordatorios automáticos de pago',  prog: 80,  estado: 'En progreso' },
  { riesgo: 'R002', accion: 'Backups diarios cifrados',           prog: 45,  estado: 'En progreso' },
  { riesgo: 'R004', accion: 'Plan de contingencia TI',            prog: 60,  estado: 'Vencido'     },
  { riesgo: 'R006', accion: 'Política de tasas variables',        prog: 100, estado: 'Completado'  },
  { riesgo: 'R008', accion: 'Protocolo de cobro judicial',        prog: 100, estado: 'Completado'  },
]

const customForm = ref({
  modulo: 'Finanzas', fechaInicio: '2026-06-01', fechaFin: '2026-06-30',
  columnas: ['Fecha', 'Concepto', 'Monto'], formato: 'PDF',
})
const columnasDisp = ['Fecha', 'Concepto', 'Monto', 'Estado', 'Responsable', 'Observaciones', 'Categoría', 'Período']

const reportesPredefinidos = [
  { nombre: 'Informe mensual gerencia',    desc: 'Resumen ejecutivo completo del período', bg: '#EBF3FF', color: '#133C65', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { nombre: 'Estado financiero',           desc: 'Resultados y Balance General del período',bg: '#F0FAF4', color: '#166534', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
  { nombre: 'Informe de cartera',          desc: 'Análisis detallado de préstamos activos', bg: '#EBF3FF', color: '#133C65', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>` },
  { nombre: 'Informe de morosidad',        desc: 'Clasificación de atrasos y gestiones',    bg: '#FEF2F2', color: '#991B1B', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>` },
  { nombre: 'Padrón de asociados',         desc: 'Listado completo con aportaciones',       bg: '#F0FAF4', color: '#166534', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
  { nombre: 'Informe de riesgos',          desc: 'Exposición a riesgos y planes vigentes',  bg: '#FFFBEB', color: '#92400E', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
]
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 20px; }

/* ── Header ──────────────────────────── */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title  { font-size: 22px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.page-subtitle { font-size: 13px; color: #4A6070; margin-top: 2px; }
.dark .page-title { color: #E2E8F0; }
.dark .page-subtitle { color: #94A3B8; }
.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

/* ── Buttons ─────────────────────────── */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #133C65; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-primary:hover { background: #1B5490; }
.btn-block { width: 100%; justify-content: center; margin-top: 4px; }
.btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: white; color: #133C65; border: 1px solid #D4E4F4; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-outline:hover { background: #EBF3FF; }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.dark .btn-outline { background: #1D293D; color: #93B8D8; border-color: #3D5069; }

/* ── Tabs ────────────────────────────── */
.tabs-wrap { background: white; border-radius: 12px; padding: 6px; border: 1px solid #E8EEF4; }
.tabs-nav { display: flex; gap: 2px; overflow-x: auto; }
.tabs-nav::-webkit-scrollbar { height: 0; }
.tab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border: none; background: transparent; color: #4A6070; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.tab-btn:hover { background: #F4F6F8; color: #133C65; }
.tab-btn--active { background: #133C65; color: white; }
.dark .tabs-wrap { background: #1D293D; border-color: #3D5069; }
.dark .tab-btn { color: #94A3B8; }
.dark .tab-btn:hover { background: #243553; color: #E2E8F0; }
.dark .tab-btn--active { background: #1B5490; color: white; }

/* ── KPI row ─────────────────────────── */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-card { background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 14px; }
.kpi-card--navy   { background: #133C65; border-color: #133C65; }
.kpi-card--green  { background: #F0FAF4; border-color: #B7E4CC; }
.kpi-card--red    { background: #FEF2F2; border-color: #FECACA; }
.kpi-card--yellow { background: #FFFBEB; border-color: #FDE68A; }
.kpi-card--orange { background: #FFF7ED; border-color: #FED7AA; }
.kpi-card--blue   { background: #EFF6FF; border-color: #BFDBFE; }
.kpi-card--gold   { background: #FFFBEB; border-color: #FDE68A; }
.kpi-value { font-size: 19px; font-weight: 700; color: #133C65; white-space: nowrap; }
.kpi-card--navy .kpi-value   { color: white; }
.kpi-card--green .kpi-value  { color: #166534; }
.kpi-card--red .kpi-value    { color: #991B1B; }
.kpi-card--yellow .kpi-value { color: #92400E; }
.kpi-card--orange .kpi-value { color: #C2410C; }
.kpi-card--blue .kpi-value   { color: #1D4ED8; }
.kpi-card--gold .kpi-value   { color: #92400E; }
.kpi-label { font-size: 12px; color: #4A6070; margin-top: 2px; }
.kpi-card--navy .kpi-label   { color: rgba(255,255,255,0.7); }
.kpi-trend { font-size: 11px; margin-top: 4px; }
.kpi-trend--up   { color: #22C55E; }
.kpi-trend--down { color: #EF4444; }
.kpi-card--navy .kpi-trend--up { color: #86EFAC; }
.kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(255,255,255,0.15); color: white; }
.kpi-card--green .kpi-icon { background: #BBF7D0; color: #166534; }
.kpi-card--blue  .kpi-icon { background: #DBEAFE; color: #1D4ED8; }
.kpi-card--gold  .kpi-icon { background: #FEF08A; color: #92400E; }
.dark .kpi-card { background: #1D293D; border-color: #3D5069; }
.dark .kpi-value { color: #E2E8F0; }
.dark .kpi-label { color: #94A3B8; }

/* ── Filters ─────────────────────────── */
.filter-select { padding: 8px 12px; border: 1px solid #D4E4F4; border-radius: 8px; font-size: 13px; background: white; color: #1A2B3C; cursor: pointer; }
.dark .filter-select { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

/* ── Data card & table ───────────────── */
.data-card { background: white; border: 1px solid #E8EEF4; border-radius: 12px; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.data-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #4A6070; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #E8EEF4; white-space: nowrap; }
.data-table td { padding: 11px 14px; font-size: 13px; color: #1A2B3C; border-bottom: 1px solid #F4F6F8; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #F8FAFE; }
.tfoot-total td { border-top: 2px solid #D4E4F4; padding: 12px 14px; background: #F5F7FB; font-size: 13px; }
.dark .data-card { background: #1D293D; border-color: #3D5069; }
.dark .data-table th { color: #94A3B8; border-color: #3D5069; }
.dark .data-table td { color: #E2E8F0; border-color: #243553; }
.dark .data-table tbody tr:hover { background: #243553; }
.dark .tfoot-total td { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.card-header-row { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .card-title { color: #93B8D8; }

/* ── Badges ──────────────────────────── */
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.badge--green  { background: #F0FAF4; color: #166534; }
.badge--red    { background: #FEF2F2; color: #991B1B; }
.badge--orange { background: #FFF7ED; color: #C2410C; }
.badge--yellow { background: #FFFBEB; color: #92400E; }
.badge--blue   { background: #EBF3FF; color: #133C65; }
.dark .badge--green  { background: rgba(16,185,129,0.15); color: #6EE7B7; }
.dark .badge--red    { background: rgba(239,68,68,0.15);  color: #FCA5A5; }
.dark .badge--yellow { background: rgba(245,158,11,0.15); color: #FCD34D; }
.dark .badge--blue   { background: rgba(147,184,216,0.12); color: #93B8D8; }

/* ── Utilities ───────────────────────── */
.td-right  { text-align: right !important; }
.td-muted  { color: #7A90A0 !important; font-size: 12px; }
.fw-600    { font-weight: 600; }
.fw-700    { font-weight: 700; }
.txt-green { color: #166534; }
.txt-red   { color: #991B1B; }
.txt-yellow{ color: #92400E; }
.txt-navy  { color: #133C65; }
.dark .txt-green { color: #6EE7B7; }
.dark .txt-red   { color: #FCA5A5; }
.dark .txt-navy  { color: #93B8D8; }
.section-title { font-size: 14px; font-weight: 700; color: #133C65; margin-bottom: 14px; }
.dark .section-title { color: #93B8D8; }
.dos-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* ── Semáforo ────────────────────────── */
.semaforo-section { background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 20px; }
.dark .semaforo-section { background: #1D293D; border-color: #3D5069; }
.semaforo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.semaforo-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: #F8FAFE; border-radius: 10px; border: 1px solid #E8EEF4; }
.dark .semaforo-card { background: #162033; border-color: #3D5069; }
.semaforo-luz { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.semaforo-luz--verde    { background: #F0FAF4; color: #166534; border: 2px solid #22C55E; }
.semaforo-luz--amarillo { background: #FFFBEB; color: #92400E; border: 2px solid #F59E0B; }
.semaforo-luz--rojo     { background: #FEF2F2; color: #991B1B; border: 2px solid #EF4444; }
.semaforo-info { flex: 1; min-width: 0; }
.semaforo-nombre { font-size: 12px; font-weight: 600; color: #1A2B3C; }
.semaforo-valor  { font-size: 16px; font-weight: 700; color: #133C65; }
.semaforo-meta   { font-size: 10px; color: #7A90A0; }
.dark .semaforo-nombre { color: #E2E8F0; }
.dark .semaforo-valor  { color: #93B8D8; }
.semaforo-estado { font-size: 11px; font-weight: 700; white-space: nowrap; }
.semaforo-estado--verde    { color: #166534; }
.semaforo-estado--amarillo { color: #92400E; }
.semaforo-estado--rojo     { color: #991B1B; }

/* ── Gráficas CSS ────────────────────── */
.grafica-section { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; }
.grafica-card { overflow: visible; }
.grafica-leyenda { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #4A6070; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 3px; }
.legend-dot--navy  { background: #133C65; }
.legend-dot--red   { background: #EF4444; }
.legend-dot--green { background: #22C55E; }

.barras-wrap { display: flex; align-items: flex-end; gap: 12px; padding: 16px 20px 12px; height: 180px; }
.barras-grupo { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.barras-col { display: flex; align-items: flex-end; gap: 3px; flex: 1; }
.barra { border-radius: 4px 4px 0 0; width: 16px; min-height: 4px; transition: height 0.4s; }
.barra--navy  { background: #133C65; }
.barra--red   { background: #EF4444; }
.barra--green { background: #22C55E; }
.barra-tooltip { font-size: 10px; color: #7A90A0; display: none; }
.barras-label { font-size: 11px; color: #7A90A0; font-weight: 600; }

.composicion-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 12px; }
.composicion-item { display: flex; flex-direction: column; gap: 4px; }
.comp-header { display: flex; justify-content: space-between; font-size: 13px; }
.comp-concepto { color: #1A2B3C; }
.comp-bar-bg   { height: 6px; background: #E8EEF4; border-radius: 3px; overflow: hidden; }
.comp-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.comp-monto    { font-size: 11px; }
.dark .comp-concepto { color: #E2E8F0; }
.dark .comp-bar-bg { background: #3D5069; }

/* ── Barras mini ─────────────────────── */
.mini-bar-wrap { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.mini-bar-bg   { height: 6px; background: #E8EEF4; border-radius: 3px; overflow: hidden; width: 80px; flex-shrink: 0; }
.mini-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.mini-bar--green { background: #22C55E; }
.mini-bar--red   { background: #EF4444; }
.mini-bar--navy  { background: #133C65; }
.mini-bar--yellow{ background: #F59E0B; }
.dark .mini-bar-bg { background: #3D5069; }

/* ── Concentración cartera ───────────── */
.concentracion-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 14px; }
.conc-item { display: flex; flex-direction: column; gap: 5px; }
.conc-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
.conc-nombre { font-weight: 600; color: #1A2B3C; }
.conc-bar-bg   { height: 8px; background: #E8EEF4; border-radius: 4px; overflow: hidden; }
.conc-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.conc-footer { display: flex; justify-content: space-between; font-size: 11px; }
.dark .conc-nombre { color: #E2E8F0; }
.dark .conc-bar-bg { background: #3D5069; }

/* ── Perfil asociados ────────────────── */
.perfil-list { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 16px; }
.perfil-seccion { display: flex; flex-direction: column; gap: 8px; }
.perfil-titulo { font-size: 11px; font-weight: 700; color: #7A90A0; text-transform: uppercase; letter-spacing: 0.04em; }
.perfil-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.perfil-label { width: 80px; flex-shrink: 0; color: #4A6070; }
.dark .perfil-label { color: #94A3B8; }

/* ── Tendencia ───────────────────────── */
.tendencia { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
.tendencia--sube    { color: #991B1B; }
.tendencia--baja    { color: #166534; }
.tendencia--estable { color: #4A6070; }
.dark .tendencia--baja    { color: #6EE7B7; }
.dark .tendencia--estable { color: #94A3B8; }

/* ── Progreso ────────────────────────── */
.prog-wrap { display: flex; align-items: center; gap: 8px; }
.prog-bg   { flex: 1; height: 6px; background: #E8EEF4; border-radius: 3px; overflow: hidden; min-width: 60px; }
.prog-fill { height: 100%; border-radius: 3px; }
.prog--green { background: #22C55E; }
.prog--blue  { background: #3B82F6; }
.prog--red   { background: #EF4444; }
.prog-pct   { font-size: 11px; font-weight: 600; color: #4A6070; white-space: nowrap; }
.dark .prog-bg { background: #3D5069; }

/* ── Personalizados ──────────────────── */
.personalizado-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }
.constructor-card { background: white; border: 1px solid #E8EEF4; border-radius: 12px; padding: 20px; }
.dark .constructor-card { background: #1D293D; border-color: #3D5069; }
.constructor-title { font-size: 14px; font-weight: 700; color: #133C65; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
.dark .constructor-title { color: #93B8D8; }
.constructor-form { display: flex; flex-direction: column; gap: 16px; }
.cform-group { display: flex; flex-direction: column; gap: 6px; }
.cform-group label { font-size: 12px; font-weight: 600; color: #4A6070; }
.cform-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.full-width { width: 100%; box-sizing: border-box; }
.checkboxes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.checkbox-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4A6070; cursor: pointer; }
.checkbox-item input { cursor: pointer; }
.radio-group { display: flex; gap: 16px; }
.radio-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4A6070; cursor: pointer; }
.dark .cform-group label { color: #94A3B8; }
.dark .checkbox-item, .dark .radio-item { color: #94A3B8; }

.predefinidos-list { display: flex; flex-direction: column; gap: 10px; }
.predef-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border: 1px solid #E8EEF4; border-radius: 10px; }
.dark .predef-item { background: #1D293D; border-color: #3D5069; }
.predef-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.predef-body { flex: 1; min-width: 0; }
.predef-nombre { font-size: 13px; font-weight: 600; color: #1A2B3C; }
.predef-desc   { font-size: 11px; color: #7A90A0; margin-top: 2px; }
.dark .predef-nombre { color: #E2E8F0; }
.dark .predef-desc   { color: #94A3B8; }

/* ── Responsive ─────────────────────── */
@media (max-width: 1200px) {
  .semaforo-grid { grid-template-columns: repeat(2, 1fr); }
  .personalizado-layout { grid-template-columns: 1fr; }
}
@media (max-width: 1100px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .dos-col { grid-template-columns: 1fr; }
  .grafica-section { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .header-actions { width: 100%; }
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .semaforo-grid { grid-template-columns: 1fr; }
  .barras-wrap { height: 140px; padding: 12px 12px 8px; gap: 6px; }
  .barra { width: 10px; }
  .cform-row { grid-template-columns: 1fr; }
  .checkboxes-grid { grid-template-columns: 1fr; }
}
</style>
