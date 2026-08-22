<template>
  <div class="ep">
    <!-- ══════════════ LISTA DE EVALUACIONES ══════════════ -->
    <template v-if="vista === 'lista'">
      <div class="ep-header-row">
        <div>
          <h3 class="section-subtitle">Evaluaciones de desempeño</h3>
          <p class="section-desc">Constructor configurable: secciones ponderadas, participantes 360°, escalas y flujo de aprobación propios</p>
        </div>
        <button class="btn-primary" @click="abrirNuevaEvaluacion">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva evaluación
        </button>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr><th>Evaluación</th><th>Periodo</th><th>Colaboradores</th><th>Completadas</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="ev in evaluaciones" :key="ev.id">
              <td><strong>{{ ev.nombre }}</strong></td>
              <td>{{ ev.periodo || '—' }}</td>
              <td>{{ conteoAsignaciones[ev.id]?.total ?? 0 }}</td>
              <td>{{ conteoAsignaciones[ev.id]?.cerradas ?? 0 }}</td>
              <td><span class="badge" :class="`badge--${ev.statusClass}`">{{ ev.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Abrir" @click="abrirDetalle(ev)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button class="action-btn action-btn--red" title="Eliminar" @click="confirmarEliminarEvaluacion(ev)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="!evaluaciones.length"><td colspan="6" class="empty-row">Sin evaluaciones registradas todavía.</td></tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════ DETALLE / CONSTRUCTOR ══════════════ -->
    <template v-else-if="vista === 'detalle' && evaluacionActual">
      <div class="ep-header-row">
        <div>
          <button class="ep-back" @click="vista = 'lista'">← Volver a evaluaciones</button>
          <h3 class="section-subtitle">{{ evaluacionActual.nombre }}</h3>
          <p class="section-desc">{{ evaluacionActual.periodo || 'Sin periodo definido' }} · <span class="badge" :class="`badge--${evaluacionActual.statusClass}`">{{ evaluacionActual.status }}</span></p>
        </div>
        <select v-if="evaluacionActual.estado !== 'finalizada'" v-model="cambioEstado" class="filter-select" @change="cambiarEstado">
          <option value="">Cambiar estado...</option>
          <option value="activa" v-if="evaluacionActual.estado !== 'activa'">Activar</option>
          <option value="finalizada">Finalizar</option>
          <option value="cancelada">Cancelar</option>
        </select>
      </div>

      <div class="ep-tabs">
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'general' }" @click="detalleTab = 'general'">1. General</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'participantes' }" @click="detalleTab = 'participantes'">2. Participantes</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'secciones' }" @click="detalleTab = 'secciones'">3. Secciones</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'preguntas' }" @click="detalleTab = 'preguntas'">4. Preguntas</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'escalas' }" @click="detalleTab = 'escalas'">5. Escalas</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'calculo' }" @click="detalleTab = 'calculo'">6. Cálculo</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'aprobacion' }" @click="detalleTab = 'aprobacion'">7. Aprobación</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'preview' }" @click="detalleTab = 'preview'">8. Vista previa</button>
        <button type="button" class="exp-tab-item" :class="{ 'exp-tab-item--active': detalleTab === 'evaluar' }" @click="detalleTab = 'evaluar'">9. Evaluar</button>
      </div>

      <!-- Tab 1: General -->
      <div v-if="detalleTab === 'general'" class="data-card ep-panel">
        <form class="modal-form" @submit.prevent="guardarGeneral">
          <div class="form-field form-field--full"><label>Nombre <span class="req">*</span></label><input v-model="generalForm.nombre" type="text" required /></div>
          <div class="form-field form-field--full"><label>Descripción</label><textarea v-model="generalForm.descripcion" rows="2"></textarea></div>
          <div class="form-row">
            <div class="form-field"><label>Periodo</label><input v-model="generalForm.periodo" type="text" placeholder="2026, I Sem. 2026..." /></div>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Fecha inicio</label><DatePicker v-model="generalForm.fechaInicio" /></div>
            <div class="form-field"><label>Fecha fin</label><DatePicker v-model="generalForm.fechaFin" /></div>
          </div>
          <div v-if="generalError" class="req" style="font-size:12.5px;">{{ generalError }}</div>
          <div class="modal-actions"><button type="submit" class="btn-primary" :disabled="generalSaving">{{ generalSaving ? 'Guardando...' : 'Guardar cambios' }}</button></div>
        </form>
      </div>

      <!-- Tab 2: Participantes -->
      <div v-else-if="detalleTab === 'participantes'" class="ep-panel">
        <div class="data-card">
          <h4 class="ep-card-title">Colaboradores evaluados</h4>
          <table class="data-table">
            <thead><tr><th>Colaborador</th><th>Departamento</th><th>Evaluadores</th><th>N°</th><th>Estado</th><th>Puntaje</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="a in asignaciones" :key="a.id">
                <td>
                  <div class="cell-user">
                    <div class="cell-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                    <span>{{ a.name }}</span>
                  </div>
                </td>
                <td>{{ a.dept }}</td>
                <td>{{ conteoParticipantes[a.id]?.completados ?? 0 }} / {{ conteoParticipantes[a.id]?.total ?? 0 }}</td>
                <td>{{ a.numero }}</td>
                <td><span class="badge" :class="`badge--${a.statusClass}`">{{ a.status }}</span></td>
                <td>{{ a.puntajeTotal != null ? Math.round(a.puntajeTotal) + ' / 100' : '—' }}<span v-if="a.resultadoEtiqueta"> ({{ a.resultadoEtiqueta }})</span></td>
                <td class="cell-actions">
                  <button class="action-btn" title="Gestionar evaluadores" @click="abrirGestionParticipantes(a)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </button>
                  <button class="action-btn action-btn--red" title="Quitar" @click="confirmarEliminarAsignacion(a)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="!asignaciones.length"><td colspan="7" class="empty-row">Sin colaboradores asignados todavía.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="data-card">
          <h4 class="ep-card-title">Asignar colaboradores</h4>
          <div class="form-row">
            <div class="form-field">
              <label>Filtrar por departamento</label>
              <select v-model="filtroDeptoAsignar">
                <option value="">Todos</option>
                <option v-for="d in departamentos" :key="d.id" :value="d.nombre">{{ d.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="checkbox-group ep-checklist">
            <label v-for="e in empleadosDisponiblesAsignar" :key="e.id" class="checkbox-item">
              <input type="checkbox" :value="e.id" v-model="empleadosSeleccionados" /> {{ nombreEmpleado(e) }}
            </label>
            <p v-if="!empleadosDisponiblesAsignar.length" class="exp-mini-empty">Todos los colaboradores de este filtro ya están asignados.</p>
          </div>
          <p class="exp-hint">Al asignar, se agrega automáticamente una autoevaluación para quienes tengan usuario del sistema vinculado. Los demás evaluadores (jefe, pares, subordinados) se agregan por colaborador con "Gestionar evaluadores".</p>
          <div class="modal-actions" style="justify-content:flex-start; gap:10px;">
            <button type="button" class="btn-outline" @click="empleadosSeleccionados = empleadosDisponiblesAsignar.map(e => e.id)">Seleccionar todos</button>
            <button type="button" class="btn-outline" @click="empleadosSeleccionados = []">Limpiar selección</button>
            <button type="button" class="btn-primary" :disabled="!empleadosSeleccionados.length || asignando" @click="asignarSeleccionados">
              {{ asignando ? 'Asignando...' : `Asignar (${empleadosSeleccionados.length})` }}
            </button>
          </div>
          <div v-if="asignarError" class="req" style="font-size:12.5px;">{{ asignarError }}</div>
        </div>
      </div>

      <!-- Tab 3: Secciones -->
      <div v-else-if="detalleTab === 'secciones'" class="ep-panel">
        <div class="ep-puntaje-check" :class="{ 'ep-puntaje-check--ok': sumaPesosSecciones === 100 }">
          Suma de pesos: <strong>{{ sumaPesosSecciones }} / 100</strong>
        </div>
        <div class="data-card">
          <ul class="exp-mini-list">
            <li v-if="!secciones.length" class="exp-mini-empty">Sin secciones todavía</li>
            <li v-for="s in secciones" :key="s.id" class="exp-mini-item">
              <div><strong>{{ s.nombre }}</strong><div class="exp-mini-sub">Peso: {{ s.peso }}% <span v-if="s.descripcion"> · {{ s.descripcion }}</span></div></div>
              <button type="button" class="action-btn action-btn--red" title="Quitar" @click="quitarSeccion(s)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </li>
          </ul>

          <div class="form-section-title">Agregar sección</div>
          <form class="modal-form" @submit.prevent="agregarSeccion">
            <div class="form-row">
              <div class="form-field"><label>Nombre <span class="req">*</span></label><input v-model="nuevaSeccion.nombre" type="text" placeholder="Competencias, Objetivos..." required /></div>
              <div class="form-field"><label>Peso (%)</label><input v-model="nuevaSeccion.peso" type="number" min="0" max="100" /></div>
            </div>
            <div class="form-field form-field--full"><label>Descripción</label><input v-model="nuevaSeccion.descripcion" type="text" /></div>
            <div v-if="seccionError" class="req" style="font-size:12.5px;">{{ seccionError }}</div>
            <div class="modal-actions"><button type="submit" class="btn-primary" :disabled="seccionSaving">{{ seccionSaving ? 'Agregando...' : '+ Agregar sección' }}</button></div>
          </form>
        </div>
      </div>

      <!-- Tab 4: Preguntas -->
      <div v-else-if="detalleTab === 'preguntas'" class="ep-panel">
        <div v-if="!secciones.length" class="exp-mini-empty">Primero crea una sección en la pestaña "3. Secciones".</div>
        <template v-else>
          <div class="form-field" style="max-width:260px;">
            <label>Sección</label>
            <select v-model="seccionEditando">
              <option v-for="s in secciones" :key="s.id" :value="s.id">{{ s.nombre }}</option>
            </select>
          </div>

          <div class="data-card">
            <ul class="exp-mini-list">
              <li v-if="!preguntasDeSeccionEditando.length" class="exp-mini-empty">Sin preguntas en esta sección todavía</li>
              <li v-for="(p, i) in preguntasDeSeccionEditando" :key="p.id" class="exp-mini-item">
                <div>
                  <strong>{{ i + 1 }}. {{ p.texto }}</strong>
                  <div class="exp-mini-sub">
                    {{ TIPO_LABEL[p.tipo] }} · peso {{ p.peso }}
                    <span v-if="p.escalaId"> · {{ escalas.find(e => e.id === p.escalaId)?.nombre }}</span>
                    <span v-if="p.obligatoria"> · obligatoria</span>
                  </div>
                </div>
                <button type="button" class="action-btn action-btn--red" title="Quitar" @click="quitarPregunta(p)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </li>
            </ul>

            <div class="form-section-title">Agregar pregunta</div>
            <form class="modal-form" @submit.prevent="agregarPregunta">
              <div class="form-field form-field--full"><label>Pregunta <span class="req">*</span></label><input v-model="nuevaPregunta.texto" type="text" required /></div>
              <div class="form-field form-field--full"><label>Descripción / instrucciones</label><input v-model="nuevaPregunta.descripcion" type="text" /></div>
              <div class="form-row">
                <div class="form-field">
                  <label>Tipo de respuesta</label>
                  <select v-model="nuevaPregunta.tipo">
                    <option v-for="t in TIPOS_PREGUNTA" :key="t.key" :value="t.key">{{ t.label }}</option>
                  </select>
                </div>
                <div class="form-field"><label>Peso dentro de la sección</label><input v-model="nuevaPregunta.peso" type="number" min="0" step="0.1" /></div>
              </div>
              <div v-if="esTipoEscala(nuevaPregunta.tipo)" class="form-field">
                <label>Escala <span class="req">*</span></label>
                <select v-model="nuevaPregunta.escalaId" required>
                  <option value="">Seleccionar</option>
                  <option v-for="e in escalas" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
                <p v-if="!escalas.length" class="exp-hint">No hay escalas creadas — ve a la pestaña "5. Escalas" primero.</p>
              </div>
              <div v-if="nuevaPregunta.tipo === 'kpi'" class="form-field"><label>Meta (valor objetivo)</label><input v-model="nuevaPregunta.metaKpi" type="number" /></div>
              <div v-if="nuevaPregunta.tipo === 'seleccion_unica' || nuevaPregunta.tipo === 'seleccion_multiple'" class="form-field form-field--full">
                <label>Opciones (separadas por coma)</label>
                <input v-model="nuevaPregunta.opcionesTexto" type="text" placeholder="Excelente, Bueno, Regular, Deficiente" />
              </div>
              <div class="checkbox-inline"><label><input v-model="nuevaPregunta.obligatoria" type="checkbox" /> Pregunta obligatoria</label></div>
              <div v-if="preguntaError" class="req" style="font-size:12.5px;">{{ preguntaError }}</div>
              <div class="modal-actions"><button type="submit" class="btn-primary" :disabled="preguntaSaving">{{ preguntaSaving ? 'Agregando...' : '+ Agregar pregunta' }}</button></div>
            </form>
          </div>
        </template>
      </div>

      <!-- Tab 5: Escalas -->
      <div v-else-if="detalleTab === 'escalas'" class="ep-panel">
        <div class="data-card">
          <div v-for="e in escalas" :key="e.id" class="ep-escala-block">
            <div class="ep-escala-header">
              <strong>{{ e.nombre }}</strong>
              <button type="button" class="action-btn action-btn--red" title="Eliminar escala" @click="quitarEscala(e)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
            <ul class="ep-escala-valores">
              <li v-for="v in e.valores" :key="v.id">
                {{ v.valor }} = {{ v.etiqueta }}
                <button type="button" class="ep-valor-quitar" @click="quitarValorEscala(e, v)">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </li>
            </ul>
            <form class="ep-escala-add" @submit.prevent="agregarValorEscala(e)">
              <input v-model="nuevoValorEscala[e.id].valor" type="number" placeholder="Valor" style="width:80px;" />
              <input v-model="nuevoValorEscala[e.id].etiqueta" type="text" placeholder="Etiqueta" />
              <button type="submit" class="btn-outline">+ Valor</button>
            </form>
          </div>
          <p v-if="!escalas.length" class="exp-mini-empty">Sin escalas creadas todavía</p>

          <div class="form-section-title">Nueva escala</div>
          <div class="form-row">
            <button type="button" class="btn-outline" @click="crearEscalaEstandar">+ Usar escala estándar 1-5</button>
            <div class="form-field"><input v-model="nuevaEscalaNombre" type="text" placeholder="Nombre de la escala personalizada" /></div>
            <button type="button" class="btn-primary" :disabled="!nuevaEscalaNombre.trim()" @click="agregarEscala">+ Crear escala</button>
          </div>
        </div>
      </div>

      <!-- Tab 6: Método de cálculo -->
      <div v-else-if="detalleTab === 'calculo'" class="ep-panel">
        <div class="data-card">
          <div class="form-field">
            <label>Método de cálculo</label>
            <select v-model="generalForm.formulaCalculo" @change="guardarGeneral">
              <option value="promedio_simple">Promedio simple</option>
              <option value="promedio_ponderado">Promedio ponderado (por peso de sección)</option>
              <option value="personalizada">Fórmula personalizada (por peso de sección)</option>
            </select>
          </div>
          <p class="exp-hint" v-if="generalForm.formulaCalculo === 'promedio_simple'">Cada sección aporta lo mismo al resultado final, sin importar su peso configurado.</p>
          <p class="exp-hint" v-else>El resultado final se calcula ponderando el promedio de cada sección por el peso (%) definido en la pestaña "3. Secciones".</p>
        </div>
      </div>

      <!-- Tab 7: Flujo de aprobación -->
      <div v-else-if="detalleTab === 'aprobacion'" class="ep-panel">
        <div class="data-card">
          <div class="form-field">
            <label>Flujo de aprobación</label>
            <select v-model="generalForm.flujoAprobacion" @change="guardarGeneral">
              <option value="ninguno">Ninguno (se cierra automáticamente al completarse)</option>
              <option value="basico">Básico: Jefe → RRHH</option>
              <option value="avanzado">Avanzado: Supervisor → Gerente → RRHH</option>
            </select>
          </div>
          <p class="exp-hint">Cuando todos los evaluadores de un colaborador terminan, la evaluación pasa por estos pasos en orden antes de cerrarse.</p>
        </div>
      </div>

      <!-- Tab 8: Vista previa -->
      <div v-else-if="detalleTab === 'preview'" class="ep-panel">
        <div class="data-card">
          <h4 class="ep-card-title">{{ evaluacionActual.nombre }}</h4>
          <p class="exp-hint">{{ evaluacionActual.descripcion || 'Sin descripción' }}</p>
          <div v-for="s in seccionesConPreguntas" :key="s.id" class="ep-pregunta-item" style="margin-bottom:12px;">
            <strong>{{ s.nombre }} — peso {{ s.peso }}%</strong>
            <div v-for="p in s.preguntas" :key="p.id" class="ep-preview-pregunta">
              <p class="ep-pregunta-texto">{{ p.texto }}<span v-if="p.obligatoria" class="req"> *</span></p>
              <p v-if="p.descripcion" class="exp-hint">{{ p.descripcion }}</p>
              <p class="exp-hint">Tipo: {{ TIPO_LABEL[p.tipo] }}<span v-if="p.escalaId"> · {{ escalas.find(e => e.id === p.escalaId)?.nombre }}</span></p>
            </div>
            <p v-if="!s.preguntas.length" class="exp-mini-empty">Sin preguntas en esta sección</p>
          </div>
          <p v-if="!secciones.length" class="exp-mini-empty">Sin secciones todavía</p>
        </div>
      </div>

      <!-- Tab 9: Evaluar -->
      <div v-else-if="detalleTab === 'evaluar'" class="ep-panel">
        <div class="data-card">
          <h4 class="ep-card-title">Colaboradores evaluados</h4>
          <table class="data-table">
            <thead><tr><th>Colaborador</th><th>Departamento</th><th>Evaluadores</th><th>N°</th><th>Estado</th><th>Puntaje</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="a in asignaciones" :key="a.id">
                <td>
                  <div class="cell-user">
                    <div class="cell-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                    <span>{{ a.name }}</span>
                  </div>
                </td>
                <td>{{ a.dept }}</td>
                <td>{{ conteoParticipantes[a.id]?.completados ?? 0 }} / {{ conteoParticipantes[a.id]?.total ?? 0 }}</td>
                <td>{{ a.numero }}</td>
                <td><span class="badge" :class="`badge--${a.statusClass}`">{{ a.status }}</span></td>
                <td>{{ a.puntajeTotal != null ? Math.round(a.puntajeTotal) + ' / 100' : '—' }}<span v-if="a.resultadoEtiqueta"> ({{ a.resultadoEtiqueta }})</span></td>
                <td class="cell-actions">
                  <button class="action-btn" title="Iniciar / editar evaluación" @click="abrirEvaluarColaborador(a)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="!asignaciones.length"><td colspan="7" class="empty-row">Sin colaboradores asignados todavía.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ══════════════ MODALES ══════════════ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-backdrop">
        <div class="modal-box" :class="{ 'modal-box--expediente': modal.type === 'resultado' || modal.type === 'gestionar-participantes' || modal.type === 'evaluar-colaborador', 'modal-box--evaluar': modal.type === 'evaluar' }">
          <button class="modal-close" @click="modal.open = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Nueva evaluación -->
          <template v-if="modal.type === 'nueva-evaluacion'">
            <h3 class="modal-title">Nueva evaluación</h3>
            <p class="modal-subtitle">Define la información general; participantes, secciones y preguntas se configuran después</p>
            <form class="modal-form" @submit.prevent="crearNuevaEvaluacion">
              <div class="form-field form-field--full"><label>Nombre <span class="req">*</span></label><input v-model="nuevaEvaluacion.nombre" type="text" required placeholder="Evaluación de desempeño anual 2026" /></div>
              <div class="form-field form-field--full"><label>Descripción</label><textarea v-model="nuevaEvaluacion.descripcion" rows="2"></textarea></div>
              <div class="form-field"><label>Periodo</label><input v-model="nuevaEvaluacion.periodo" type="text" placeholder="2026" /></div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio</label><DatePicker v-model="nuevaEvaluacion.fechaInicio" /></div>
                <div class="form-field"><label>Fecha fin</label><DatePicker v-model="nuevaEvaluacion.fechaFin" /></div>
              </div>
              <div v-if="nuevaEvaluacionError" class="req" style="font-size:12.5px;">{{ nuevaEvaluacionError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary" :disabled="nuevaEvaluacionSaving">{{ nuevaEvaluacionSaving ? 'Creando...' : 'Crear evaluación' }}</button>
              </div>
            </form>
          </template>

          <!-- Confirmar eliminación de evaluación -->
          <template v-if="modal.type === 'eliminar-evaluacion'">
            <h3 class="modal-title">Eliminar evaluación</h3>
            <p class="modal-subtitle">Esto elimina también sus secciones, preguntas, escalas y evaluaciones individuales. No se puede deshacer.</p>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoEvaluacion" @click="eliminarEvaluacionConfirmada">
                {{ eliminandoEvaluacion ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Confirmar eliminación de asignación -->
          <template v-if="modal.type === 'eliminar-asignacion'">
            <h3 class="modal-title">Quitar colaborador</h3>
            <p class="modal-subtitle">¿Seguro que deseas quitar a <strong>{{ modal.data?.name }}</strong> de esta evaluación? Se perderán sus evaluadores y respuestas.</p>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoAsignacion" @click="eliminarAsignacionConfirmada">
                {{ eliminandoAsignacion ? 'Quitando...' : 'Quitar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Gestionar participantes (evaluadores 360°) -->
          <template v-if="modal.type === 'gestionar-participantes' && asignacionParaParticipantes">
            <h3 class="modal-title">Evaluadores de {{ asignacionParaParticipantes.name }}</h3>
            <p class="modal-subtitle">{{ asignacionParaParticipantes.numero }}</p>

            <ul class="exp-mini-list">
              <li v-if="!participantesActuales.length" class="exp-mini-empty">Sin evaluadores agregados</li>
              <li v-for="p in participantesActuales" :key="p.id" class="exp-mini-item">
                <div>
                  <strong>{{ p.nombreEvaluador }}</strong>
                  <div class="exp-mini-sub">{{ p.tipoEvaluadorLabel }} · <span class="badge" :class="`badge--${p.statusClass}`">{{ p.status }}</span></div>
                </div>
                <div style="display:flex; gap:4px;">
                  <button type="button" class="action-btn action-btn--red" title="Quitar" @click="quitarParticipante(p)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </li>
            </ul>

            <div class="form-section-title">Agregar evaluador</div>
            <form class="modal-form" @submit.prevent="agregarParticipanteForm">
              <div class="form-row">
                <div class="form-field">
                  <label>Tipo de evaluador</label>
                  <select v-model="nuevoParticipante.tipoEvaluador">
                    <option v-for="t in TIPOS_EVALUADOR" :key="t.key" :value="t.key">{{ t.label }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Usuario del sistema (opcional)</label>
                  <select v-model="nuevoParticipante.evaluadorProfileId">
                    <option value="">Ninguno (indicar nombre)</option>
                    <option v-for="p in profilesCooperativa" :key="p.id" :value="p.id">{{ p.full_name || p.email }}</option>
                  </select>
                </div>
              </div>
              <div v-if="!nuevoParticipante.evaluadorProfileId" class="form-field"><label>Nombre del evaluador</label><input v-model="nuevoParticipante.nombreEvaluador" type="text" /></div>
              <div v-if="participanteError" class="req" style="font-size:12.5px;">{{ participanteError }}</div>
              <div class="modal-actions"><button type="submit" class="btn-primary" :disabled="agregandoParticipante">{{ agregandoParticipante ? 'Agregando...' : '+ Agregar evaluador' }}</button></div>
            </form>
          </template>

          <!-- Evaluar colaborador: elegir a cuál evaluador de este colaborador editarle su evaluación -->
          <template v-if="modal.type === 'evaluar-colaborador' && asignacionParaParticipantes">
            <h3 class="modal-title">Evaluar a {{ asignacionParaParticipantes.name }}</h3>
            <p class="modal-subtitle">{{ asignacionParaParticipantes.numero }}</p>

            <ul class="exp-mini-list">
              <li v-if="!participantesActuales.length" class="exp-mini-empty">Este colaborador todavía no tiene evaluadores asignados. Agrégalos desde "Gestionar evaluadores" en la pestaña 2.</li>
              <li v-for="p in participantesActuales" :key="p.id" class="exp-mini-item">
                <div>
                  <strong>{{ p.nombreEvaluador }}</strong>
                  <div class="exp-mini-sub">{{ p.tipoEvaluadorLabel }} · <span class="badge" :class="`badge--${p.statusClass}`">{{ p.status }}</span></div>
                </div>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn-outline btn-outline--sm" @click="abrirEvaluar(p)">Evaluar</button>
                  <button type="button" class="btn-outline btn-outline--sm btn-outline--danger" @click="confirmarEliminarParticipante(p)">Eliminar evaluación</button>
                </div>
              </li>
            </ul>
            <div class="modal-actions"><button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button></div>
          </template>

          <!-- Confirmar eliminación de una evaluación (participante) -->
          <template v-if="modal.type === 'eliminar-participante' && participanteAEliminar">
            <h3 class="modal-title">Eliminar evaluación</h3>
            <p class="modal-subtitle">¿Seguro que deseas eliminar la evaluación de <strong>{{ participanteAEliminar.nombreEvaluador }}</strong> ({{ participanteAEliminar.tipoEvaluadorLabel }})? Se perderán sus respuestas. No se puede deshacer.</p>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.type = 'evaluar-colaborador'">Cancelar</button>
              <button type="button" class="btn-primary btn-primary--danger" :disabled="eliminandoParticipante" @click="eliminarParticipanteConfirmado">
                {{ eliminandoParticipante ? 'Eliminando...' : 'Eliminar definitivamente' }}
              </button>
            </div>
          </template>

          <!-- Realizar / ver evaluación de un participante -->
          <template v-if="modal.type === 'evaluar' && participanteActual">
            <h3 class="modal-title">{{ evaluacionActual.nombre }}</h3>
            <p class="modal-subtitle">{{ asignacionDeParticipante?.name }} · evaluado por {{ participanteActual.nombreEvaluador }} ({{ participanteActual.tipoEvaluadorLabel }})</p>

            <div v-if="puedeEvaluar" class="ep-progreso">
              Preguntas completadas: {{ preguntasCompletadas }} / {{ preguntas.length }}
            </div>

            <div class="ep-seccion-tabs">
              <button
                v-for="s in seccionesConPreguntas.filter(s => s.preguntas.length)" :key="s.id"
                type="button" class="exp-tab-item"
                :class="{ 'exp-tab-item--active': seccionTabActiva === s.id }"
                @click="seccionTabActiva = s.id"
              >{{ s.nombre }} ({{ preguntasCompletadasEnSeccion(s) }}/{{ s.preguntas.length }})</button>
            </div>

            <div class="ep-preguntas-form">
              <div v-for="p in preguntasSeccionActiva" :key="p.id" class="ep-pregunta-item">
                <label class="ep-pregunta-texto">{{ p.texto }}<span v-if="p.obligatoria" class="req"> *</span></label>
                <p v-if="p.descripcion" class="exp-hint">{{ p.descripcion }}</p>

                <div v-if="esTipoEscala(p.tipo)">
                  <select v-model="respuestasForm[p.id].valorNumerico" :disabled="!puedeEvaluar">
                    <option value="">Seleccionar</option>
                    <option v-for="v in escalas.find(e => e.id === p.escalaId)?.valores || []" :key="v.id" :value="v.valor">{{ v.valor }} = {{ v.etiqueta }}</option>
                  </select>
                </div>
                <div v-else-if="p.tipo === 'texto_libre'"><textarea v-model="respuestasForm[p.id].valorTexto" rows="2" :disabled="!puedeEvaluar"></textarea></div>
                <div v-else-if="p.tipo === 'seleccion_unica'">
                  <select v-model="respuestasForm[p.id].valorTexto" :disabled="!puedeEvaluar">
                    <option value="">Seleccionar</option>
                    <option v-for="op in p.opciones" :key="op" :value="op">{{ op }}</option>
                  </select>
                </div>
                <div v-else-if="p.tipo === 'seleccion_multiple'" class="checkbox-group">
                  <label v-for="op in p.opciones" :key="op" class="checkbox-item">
                    <input type="checkbox" :value="op" v-model="respuestasForm[p.id].valorOpciones" :disabled="!puedeEvaluar" /> {{ op }}
                  </label>
                </div>
                <div v-else-if="p.tipo === 'porcentaje'" class="ep-puntaje-input">
                  <input v-model="respuestasForm[p.id].valorNumerico" type="number" min="0" max="100" :disabled="!puedeEvaluar" /> %
                </div>
                <div v-else-if="p.tipo === 'kpi'" class="ep-puntaje-input">
                  <input v-model="respuestasForm[p.id].valorNumerico" type="number" :disabled="!puedeEvaluar" /> <span v-if="p.metaKpi"> / meta: {{ p.metaKpi }}</span>
                </div>

                <textarea v-model="respuestasForm[p.id].comentario" rows="1" placeholder="Comentario (opcional)" :disabled="!puedeEvaluar"></textarea>
              </div>
              <p v-if="!preguntasSeccionActiva.length" class="exp-mini-empty">Sin preguntas en esta sección</p>
            </div>

            <div class="form-field"><label>Comentario general</label><textarea v-model="comentarioParticipanteForm" rows="2" :disabled="!puedeEvaluar"></textarea></div>

            <div v-if="participanteActual.puntajeTotal != null" class="ep-resultado">
              <strong>{{ Math.round(participanteActual.puntajeTotal) }} / 100</strong>
            </div>

            <div v-if="evaluarError" class="req" style="font-size:12.5px;">{{ evaluarError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
              <button v-if="puedeEvaluar" type="button" class="btn-outline" :disabled="guardandoAvance" @click="aceptarAvance">{{ guardandoAvance ? 'Guardando...' : 'Aceptar' }}</button>
              <button v-if="puedeEvaluar" type="button" class="btn-primary" :disabled="completando" @click="completarEvaluacion">{{ completando ? 'Completando...' : 'Completar evaluación' }}</button>
            </div>
          </template>

          <!-- Resultado / aprobación / plan de mejora -->
          <template v-if="modal.type === 'resultado' && asignacionActual">
            <h3 class="modal-title">{{ asignacionActual.name }}</h3>
            <p class="modal-subtitle">{{ asignacionActual.numero }} · {{ evaluacionActual.nombre }}</p>

            <div class="ep-resultado" style="margin-bottom:14px;">
              <strong>{{ asignacionActual.puntajeTotal != null ? Math.round(asignacionActual.puntajeTotal) : '—' }} / 100</strong>
              <span v-if="asignacionActual.resultadoEtiqueta"> — {{ asignacionActual.resultadoEtiqueta.toUpperCase() }}</span>
              <div><span class="badge" :class="`badge--${asignacionActual.statusClass}`">{{ asignacionActual.status }}</span></div>
            </div>

            <div class="form-section-title">Evaluadores</div>
            <ul class="exp-mini-list">
              <li v-for="p in participantesResultado" :key="p.id" class="exp-mini-item">
                <div><strong>{{ p.nombreEvaluador }}</strong><div class="exp-mini-sub">{{ p.tipoEvaluadorLabel }}<span v-if="p.comentario"> — {{ p.comentario }}</span></div></div>
                <span>{{ p.puntajeTotal != null ? Math.round(p.puntajeTotal) : '—' }} / 100</span>
              </li>
            </ul>

            <template v-if="pasosAprobacion.length">
              <div class="form-section-title">Flujo de aprobación</div>
              <ul class="exp-mini-list">
                <li v-for="paso in pasosAprobacion" :key="paso.id" class="exp-mini-item">
                  <div><strong>{{ paso.pasoNombre }}</strong><div class="exp-mini-sub" v-if="paso.aprobadorNombre">{{ paso.aprobadorNombre }}<span v-if="paso.comentario"> — {{ paso.comentario }}</span></div></div>
                  <div v-if="paso.estado === 'pendiente' && esPasoActivo(paso)" style="display:flex; gap:6px;">
                    <button type="button" class="btn-outline" @click="resolverPaso(paso, false)">Rechazar</button>
                    <button type="button" class="btn-primary" @click="resolverPaso(paso, true)">Aprobar</button>
                  </div>
                  <span v-else class="badge" :class="`badge--${paso.estado === 'aprobado' ? 'green' : paso.estado === 'rechazado' ? 'red' : 'gray'}`">{{ paso.estado }}</span>
                </li>
              </ul>
            </template>

            <div class="form-section-title">Plan de mejora</div>
            <ul class="exp-mini-list">
              <li v-if="!planMejora.length" class="exp-mini-empty">Sin acciones de mejora registradas</li>
              <li v-for="acc in planMejora" :key="acc.id" class="exp-mini-item">
                <div>
                  <strong>{{ acc.accion }}</strong>
                  <div class="exp-mini-sub">{{ acc.responsable || 'Sin responsable' }} · compromiso {{ acc.fechaCompromiso || '—' }}</div>
                </div>
                <select :value="acc.estado" @change="cambiarEstadoAccion(acc, $event.target.value)">
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completado">Completado</option>
                </select>
              </li>
            </ul>
            <form class="modal-form" @submit.prevent="agregarAccionMejora">
              <div class="form-field form-field--full"><label>Nueva acción</label><input v-model="nuevaAccion.accion" type="text" placeholder="Capacitación en..." /></div>
              <div class="form-row">
                <div class="form-field"><label>Responsable</label><input v-model="nuevaAccion.responsable" type="text" /></div>
                <div class="form-field"><label>Fecha compromiso</label><DatePicker v-model="nuevaAccion.fechaCompromiso" /></div>
              </div>
              <div class="modal-actions" style="justify-content:flex-start;"><button type="submit" class="btn-outline" :disabled="!nuevaAccion.accion.trim()">+ Agregar acción</button></div>
            </form>

            <div class="form-section-title">Documento firmado</div>
            <div v-if="asignacionActual.documentoPath" class="adjunto-actual">
              <span class="adjunto-nombre" @click="verDocumentoFirmado">{{ asignacionActual.documentoNombre }}</span>
            </div>
            <input v-else type="file" @change="onArchivoFirmadoChange" />
            <button v-if="!asignacionActual.documentoPath && archivoFirmado" type="button" class="btn-outline" style="margin-top:8px;" :disabled="subiendoFirmado" @click="subirFirmado">
              {{ subiendoFirmado ? 'Subiendo...' : 'Subir evaluación firmada' }}
            </button>

            <div class="modal-actions" style="margin-top:14px;">
              <button type="button" class="btn-outline" @click="modal.open = false">Cerrar</button>
              <button type="button" class="btn-primary" @click="descargarInforme(asignacionActual)">Descargar informe</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import DatePicker from './DatePicker.vue'
import { useAuth } from '../composables/useAuth.js'
import { usePersonal } from '../composables/usePersonal.js'
import { useDocumentos } from '../composables/useDocumentos.js'
import { exportInformeEvaluacion } from '../composables/useExport.js'
import { useEvaluaciones, TIPOS_PREGUNTA, TIPOS_EVALUADOR } from '../composables/useEvaluaciones.js'

const TIPO_LABEL = Object.fromEntries(TIPOS_PREGUNTA.map((t) => [t.key, t.label]))
function esTipoEscala(tipo) { return tipo === 'escala_numerica' || tipo === 'escala_personalizada' }

const { cooperativaId, currentUser } = useAuth()
const { listDepartamentos, listEmpleados, listPerfilesCooperativa } = usePersonal()
const { getUrlDescarga } = useDocumentos()
const {
  listEvaluaciones, crearEvaluacion, actualizarEvaluacion, cambiarEstadoEvaluacion, eliminarEvaluacion,
  listSecciones, crearSeccion, eliminarSeccion,
  listEscalas, crearEscala, eliminarEscala, crearValorEscala, eliminarValorEscala, crearEscalaEstandar1a5,
  listPreguntasPorEvaluacion, crearPregunta, eliminarPregunta,
  listRangos,
  listAsignaciones, crearAsignacionesMasivo, eliminarAsignacion, getAsignacion,
  listParticipantes, agregarParticipante, eliminarParticipante, actualizarParticipante,
  listRespuestas, guardarRespuesta, completarParticipante,
  listPasosAprobacion, resolverPasoAprobacion,
  listPlanMejora, crearAccionMejora, actualizarEstadoAccionMejora,
  subirDocumentoFirmado, eliminarDocumentoFirmado,
} = useEvaluaciones()

function nombreEmpleado(e) { return [e.name, e.primerApellido, e.segundoApellido].filter(Boolean).join(' ') }

/* ── Estado general ── */
const vista = ref('lista')
const evaluaciones = ref([])
const empleados = ref([])
const departamentos = ref([])
const profilesCooperativa = ref([])
const conteoAsignaciones = ref({})
const conteoParticipantes = ref({})
const modal = reactive({ open: false, type: null, data: null })

async function cargarEvaluaciones() {
  const { data } = await listEvaluaciones()
  evaluaciones.value = data || []
  const conteos = {}
  await Promise.all(evaluaciones.value.map(async (ev) => {
    const { data: asigs } = await listAsignaciones(ev.id)
    conteos[ev.id] = { total: (asigs || []).length, cerradas: (asigs || []).filter((a) => a.estado === 'cerrada' || a.estado === 'aprobada').length }
  }))
  conteoAsignaciones.value = conteos
}
async function cargarEmpleados() { empleados.value = (await listEmpleados()).data || [] }
async function cargarDepartamentos() { departamentos.value = (await listDepartamentos()).data || [] }
async function cargarProfiles() { profilesCooperativa.value = (await listPerfilesCooperativa(cooperativaId.value)).data || [] }

onMounted(() => { cargarEvaluaciones(); cargarEmpleados(); cargarDepartamentos(); cargarProfiles() })

/* ── Nueva evaluación ── */
const EMPTY_NUEVA_EVAL = { nombre: '', descripcion: '', periodo: '', fechaInicio: '', fechaFin: '', formulaCalculo: 'promedio_ponderado', flujoAprobacion: 'basico' }
const nuevaEvaluacion = reactive({ ...EMPTY_NUEVA_EVAL })
const nuevaEvaluacionError = ref(null)
const nuevaEvaluacionSaving = ref(false)

function abrirNuevaEvaluacion() {
  modal.type = 'nueva-evaluacion'; modal.data = null
  Object.assign(nuevaEvaluacion, EMPTY_NUEVA_EVAL)
  nuevaEvaluacionError.value = null
  modal.open = true
}

async function crearNuevaEvaluacion() {
  nuevaEvaluacionError.value = null
  if (!nuevaEvaluacion.nombre.trim()) { nuevaEvaluacionError.value = 'Escribe un nombre.'; return }
  nuevaEvaluacionSaving.value = true
  const { data, error } = await crearEvaluacion(cooperativaId.value, currentUser.value?.id, nuevaEvaluacion)
  nuevaEvaluacionSaving.value = false
  if (error) { nuevaEvaluacionError.value = error.message; return }
  await cargarEvaluaciones()
  modal.open = false
  abrirDetalle(evaluaciones.value.find((e) => e.id === data.id))
}

const eliminandoEvaluacion = ref(false)
function confirmarEliminarEvaluacion(ev) { modal.type = 'eliminar-evaluacion'; modal.data = ev; modal.open = true }
async function eliminarEvaluacionConfirmada() {
  eliminandoEvaluacion.value = true
  await eliminarEvaluacion(modal.data.id)
  eliminandoEvaluacion.value = false
  modal.open = false
  await cargarEvaluaciones()
}

/* ── Detalle ── */
const evaluacionActual = ref(null)
const detalleTab = ref('general')
const secciones = ref([])
const escalas = ref([])
const rangos = ref([])
const preguntas = ref([])
const asignaciones = ref([])
const cambioEstado = ref('')

const generalForm = reactive({ ...EMPTY_NUEVA_EVAL })
const generalError = ref(null)
const generalSaving = ref(false)

async function abrirDetalle(ev) {
  if (!ev) return
  evaluacionActual.value = ev
  vista.value = 'detalle'
  detalleTab.value = 'general'
  cambioEstado.value = ''
  Object.assign(generalForm, {
    nombre: ev.nombre, descripcion: ev.descripcion, periodo: ev.periodo,
    fechaInicio: ev.fechaInicio || '', fechaFin: ev.fechaFin || '',
    formulaCalculo: ev.formulaCalculo, flujoAprobacion: ev.flujoAprobacion,
  })
  await cargarDetalle()
}

async function cargarDetalle() {
  const [{ data: secs }, { data: escs }, { data: rgs }, { data: pregs }, { data: asigs }] = await Promise.all([
    listSecciones(evaluacionActual.value.id),
    listEscalas(evaluacionActual.value.id),
    listRangos(evaluacionActual.value.id),
    listPreguntasPorEvaluacion(evaluacionActual.value.id),
    listAsignaciones(evaluacionActual.value.id),
  ])
  secciones.value = secs || []
  escalas.value = escs || []
  rangos.value = rgs || []
  preguntas.value = pregs || []
  asignaciones.value = asigs || []
  if (!seccionEditando.value && secciones.value.length) seccionEditando.value = secciones.value[0].id

  const conteos = {}
  await Promise.all(asignaciones.value.map(async (a) => {
    const { data: parts } = await listParticipantes(a.id)
    conteos[a.id] = { total: (parts || []).length, completados: (parts || []).filter((p) => p.estado === 'completado').length }
  }))
  conteoParticipantes.value = conteos
}

async function guardarGeneral() {
  generalError.value = null
  if (!generalForm.nombre.trim()) { generalError.value = 'Escribe un nombre.'; return }
  generalSaving.value = true
  const { data, error } = await actualizarEvaluacion(evaluacionActual.value.id, generalForm)
  generalSaving.value = false
  if (error) { generalError.value = error.message; return }
  await cargarEvaluaciones()
  evaluacionActual.value = evaluaciones.value.find((e) => e.id === data.id)
}

async function cambiarEstado() {
  if (!cambioEstado.value) return
  await cambiarEstadoEvaluacion(evaluacionActual.value.id, cambioEstado.value)
  await cargarEvaluaciones()
  evaluacionActual.value = evaluaciones.value.find((e) => e.id === evaluacionActual.value.id)
  cambioEstado.value = ''
}

/* ── Secciones ── */
const sumaPesosSecciones = computed(() => secciones.value.reduce((s, sec) => s + (Number(sec.peso) || 0), 0))
const EMPTY_SECCION = { nombre: '', descripcion: '', peso: 0 }
const nuevaSeccion = reactive({ ...EMPTY_SECCION })
const seccionError = ref(null)
const seccionSaving = ref(false)

async function agregarSeccion() {
  seccionError.value = null
  if (!nuevaSeccion.nombre.trim()) { seccionError.value = 'Escribe un nombre.'; return }
  seccionSaving.value = true
  const { error } = await crearSeccion(evaluacionActual.value.id, { ...nuevaSeccion, orden: secciones.value.length })
  seccionSaving.value = false
  if (error) { seccionError.value = error.message; return }
  Object.assign(nuevaSeccion, EMPTY_SECCION)
  await cargarDetalle()
}
async function quitarSeccion(s) {
  if (!confirm(`¿Eliminar la sección "${s.nombre}"? También se eliminan sus preguntas.`)) return
  await eliminarSeccion(s.id)
  await cargarDetalle()
}

/* ── Preguntas ── */
const seccionEditando = ref('')
const preguntasDeSeccionEditando = computed(() => preguntas.value.filter((p) => p.seccionId === seccionEditando.value))
const seccionesConPreguntas = computed(() => secciones.value.map((s) => ({ ...s, preguntas: preguntas.value.filter((p) => p.seccionId === s.id) })))

const EMPTY_PREGUNTA = { texto: '', descripcion: '', tipo: 'escala_numerica', escalaId: '', metaKpi: '', opcionesTexto: '', peso: 1, obligatoria: true }
const nuevaPregunta = reactive({ ...EMPTY_PREGUNTA })
const preguntaError = ref(null)
const preguntaSaving = ref(false)

async function agregarPregunta() {
  preguntaError.value = null
  if (!nuevaPregunta.texto.trim()) { preguntaError.value = 'Escribe la pregunta.'; return }
  if (esTipoEscala(nuevaPregunta.tipo) && !nuevaPregunta.escalaId) { preguntaError.value = 'Selecciona una escala.'; return }
  preguntaSaving.value = true
  const opciones = (nuevaPregunta.tipo === 'seleccion_unica' || nuevaPregunta.tipo === 'seleccion_multiple')
    ? nuevaPregunta.opcionesTexto.split(',').map((o) => o.trim()).filter(Boolean)
    : []
  const { error } = await crearPregunta(seccionEditando.value, { ...nuevaPregunta, opciones, orden: preguntasDeSeccionEditando.value.length })
  preguntaSaving.value = false
  if (error) { preguntaError.value = error.message; return }
  Object.assign(nuevaPregunta, EMPTY_PREGUNTA)
  await cargarDetalle()
}
async function quitarPregunta(p) {
  if (!confirm(`¿Eliminar la pregunta "${p.texto}"?`)) return
  await eliminarPregunta(p.id)
  await cargarDetalle()
}

/* ── Escalas ── */
const nuevaEscalaNombre = ref('')
const nuevoValorEscala = ref({})
watch(escalas, (list) => {
  list.forEach((e) => { if (!nuevoValorEscala.value[e.id]) nuevoValorEscala.value[e.id] = { valor: '', etiqueta: '' } })
}, { immediate: true })

async function crearEscalaEstandar() {
  await crearEscalaEstandar1a5(evaluacionActual.value.id)
  await cargarDetalle()
}
async function agregarEscala() {
  if (!nuevaEscalaNombre.value.trim()) return
  await crearEscala(evaluacionActual.value.id, nuevaEscalaNombre.value.trim(), escalas.value.length)
  nuevaEscalaNombre.value = ''
  await cargarDetalle()
}
async function quitarEscala(e) {
  if (!confirm(`¿Eliminar la escala "${e.nombre}"? Las preguntas que la usan quedarán sin escala.`)) return
  await eliminarEscala(e.id)
  await cargarDetalle()
}
async function agregarValorEscala(e) {
  const v = nuevoValorEscala.value[e.id]
  if (!v?.etiqueta?.trim() || v.valor === '') return
  await crearValorEscala(e.id, { valor: v.valor, etiqueta: v.etiqueta, orden: e.valores.length })
  nuevoValorEscala.value[e.id] = { valor: '', etiqueta: '' }
  await cargarDetalle()
}
async function quitarValorEscala(e, v) {
  await eliminarValorEscala(v.id)
  await cargarDetalle()
}

/* ── Participantes / asignación de colaboradores ── */
const filtroDeptoAsignar = ref('')
const empleadosSeleccionados = ref([])
const asignando = ref(false)
const asignarError = ref(null)

const empleadosDisponiblesAsignar = computed(() => {
  const yaAsignados = new Set(asignaciones.value.map((a) => a.empleadoId))
  return empleados.value.filter((e) => e.active && !yaAsignados.has(e.id) && (!filtroDeptoAsignar.value || e.dept === filtroDeptoAsignar.value))
})

async function asignarSeleccionados() {
  asignarError.value = null
  asignando.value = true
  const empleadosAAsignar = empleados.value.filter((e) => empleadosSeleccionados.value.includes(e.id))
  const { data, error } = await crearAsignacionesMasivo(cooperativaId.value, evaluacionActual.value.id, empleadosSeleccionados.value)
  if (error) {
    asignando.value = false
    asignarError.value = error.message
    return
  }
  // Autoevaluación automática para quienes ya tengan usuario del sistema vinculado.
  await Promise.all((data || []).map((asig) => {
    const emp = empleadosAAsignar.find((e) => e.id === asig.empleado_id)
    if (!emp?.profileId) return null
    return agregarParticipante(cooperativaId.value, asig.id, { evaluadorProfileId: emp.profileId, tipoEvaluador: 'autoevaluacion' })
  }))
  asignando.value = false
  empleadosSeleccionados.value = []
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

const eliminandoAsignacion = ref(false)
function confirmarEliminarAsignacion(a) { modal.type = 'eliminar-asignacion'; modal.data = a; modal.open = true }
async function eliminarAsignacionConfirmada() {
  eliminandoAsignacion.value = true
  await eliminarAsignacion(modal.data.id)
  eliminandoAsignacion.value = false
  modal.open = false
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

/* ── Gestionar participantes de una asignación ── */
const asignacionParaParticipantes = ref(null)
const participantesActuales = ref([])
const EMPTY_PARTICIPANTE = { tipoEvaluador: 'jefe', evaluadorProfileId: '', nombreEvaluador: '' }
const nuevoParticipante = reactive({ ...EMPTY_PARTICIPANTE })
const participanteError = ref(null)
const agregandoParticipante = ref(false)

async function abrirGestionParticipantes(a) {
  modal.type = 'gestionar-participantes'
  modal.data = a
  asignacionParaParticipantes.value = a
  Object.assign(nuevoParticipante, EMPTY_PARTICIPANTE)
  participanteError.value = null
  const { data } = await listParticipantes(a.id)
  participantesActuales.value = data || []
  modal.open = true
}

async function abrirEvaluarColaborador(a) {
  modal.type = 'evaluar-colaborador'
  modal.data = a
  asignacionParaParticipantes.value = a
  const { data } = await listParticipantes(a.id)
  participantesActuales.value = data || []
  modal.open = true
}

const participanteAEliminar = ref(null)
const eliminandoParticipante = ref(false)

function confirmarEliminarParticipante(p) {
  modal.type = 'eliminar-participante'
  participanteAEliminar.value = p
}

async function eliminarParticipanteConfirmado() {
  eliminandoParticipante.value = true
  await eliminarParticipante(participanteAEliminar.value.id)
  eliminandoParticipante.value = false
  const { data } = await listParticipantes(asignacionParaParticipantes.value.id)
  participantesActuales.value = data || []
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
  participanteAEliminar.value = null
  modal.type = 'evaluar-colaborador'
}

async function agregarParticipanteForm() {
  participanteError.value = null
  if (!nuevoParticipante.evaluadorProfileId && !nuevoParticipante.nombreEvaluador.trim()) {
    participanteError.value = 'Selecciona un usuario o escribe el nombre del evaluador.'
    return
  }
  agregandoParticipante.value = true
  const { error } = await agregarParticipante(cooperativaId.value, asignacionParaParticipantes.value.id, nuevoParticipante)
  agregandoParticipante.value = false
  if (error) { participanteError.value = error.message; return }
  Object.assign(nuevoParticipante, EMPTY_PARTICIPANTE)
  const { data } = await listParticipantes(asignacionParaParticipantes.value.id)
  participantesActuales.value = data || []
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

async function quitarParticipante(p) {
  if (!confirm(`¿Quitar a ${p.nombreEvaluador} como evaluador?`)) return
  await eliminarParticipante(p.id)
  const { data } = await listParticipantes(asignacionParaParticipantes.value.id)
  participantesActuales.value = data || []
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

/* ── Realizar evaluación (por participante) ── */
const participanteActual = ref(null)
const asignacionDeParticipante = ref(null)
const respuestasForm = ref({})
const comentarioParticipanteForm = ref('')
const evaluarError = ref(null)
const guardandoAvance = ref(false)
const completando = ref(false)
const seccionTabActiva = ref(null)

const puedeEvaluar = computed(() => participanteActual.value && participanteActual.value.estado !== 'completado')

const preguntasSeccionActiva = computed(() => seccionesConPreguntas.value.find((s) => s.id === seccionTabActiva.value)?.preguntas || [])

function preguntasCompletadasEnSeccion(seccion) {
  return seccion.preguntas.filter((p) => {
    const r = respuestasForm.value[p.id]
    if (!r) return false
    if (esTipoEscala(p.tipo) || p.tipo === 'porcentaje' || p.tipo === 'kpi') return r.valorNumerico !== '' && r.valorNumerico != null
    if (p.tipo === 'seleccion_multiple') return r.valorOpciones.length > 0
    return !!(r.valorTexto || r.comentario)
  }).length
}

function vaciaRespuesta() { return { valorNumerico: '', valorTexto: '', valorOpciones: [], comentario: '' } }

async function abrirEvaluar(p) {
  modal.type = 'evaluar'
  modal.data = p
  participanteActual.value = p
  asignacionDeParticipante.value = asignacionParaParticipantes.value
  evaluarError.value = null
  comentarioParticipanteForm.value = p.comentario || ''

  const { data: resp } = await listRespuestas(p.id)
  const respuestasPorPregunta = new Map((resp || []).map((r) => [r.pregunta_id, r]))
  const form = {}
  preguntas.value.forEach((preg) => {
    const r = respuestasPorPregunta.get(preg.id)
    form[preg.id] = r
      ? { valorNumerico: r.valor_numerico ?? '', valorTexto: r.valor_texto || '', valorOpciones: r.valor_opciones || [], comentario: r.comentario || '' }
      : vaciaRespuesta()
  })
  respuestasForm.value = form
  seccionTabActiva.value = seccionesConPreguntas.value.find((s) => s.preguntas.length)?.id || null
  modal.open = true

  if (p.estado === 'pendiente') {
    await actualizarParticipante(p.id, { estado: 'en_proceso' })
    participanteActual.value.estado = 'en_proceso'
  }
}

const preguntasCompletadas = computed(() => preguntas.value.filter((p) => {
  const r = respuestasForm.value[p.id]
  if (!r) return false
  if (esTipoEscala(p.tipo) || p.tipo === 'porcentaje' || p.tipo === 'kpi') return r.valorNumerico !== '' && r.valorNumerico != null
  if (p.tipo === 'seleccion_multiple') return r.valorOpciones.length > 0
  return !!(r.valorTexto || r.comentario)
}).length)

async function persistirRespuestas() {
  await Promise.all(preguntas.value.map((p) => guardarRespuesta(cooperativaId.value, participanteActual.value.id, p.id, respuestasForm.value[p.id])))
}

async function guardarAvance() {
  guardandoAvance.value = true
  evaluarError.value = null
  await persistirRespuestas()
  guardandoAvance.value = false
}

async function aceptarAvance() {
  await guardarAvance()
  modal.open = false
}

async function completarEvaluacion() {
  const obligatoriasSinResponder = preguntas.value.filter((p) => {
    if (!p.obligatoria) return false
    const r = respuestasForm.value[p.id]
    if (esTipoEscala(p.tipo) || p.tipo === 'porcentaje' || p.tipo === 'kpi') return r.valorNumerico === '' || r.valorNumerico == null
    if (p.tipo === 'seleccion_multiple') return !r.valorOpciones.length
    return !r.valorTexto && !r.comentario
  })
  if (obligatoriasSinResponder.length) { evaluarError.value = 'Completa todas las preguntas obligatorias antes de finalizar.'; return }

  completando.value = true
  evaluarError.value = null
  await persistirRespuestas()
  const { data: respuestasGuardadas } = await listRespuestas(participanteActual.value.id)
  const { data, error } = await completarParticipante(participanteActual.value.id, {
    comentario: comentarioParticipanteForm.value,
    evaluacion: evaluacionActual.value,
    secciones: secciones.value,
    preguntas: preguntas.value,
    escalas: escalas.value,
    respuestas: respuestasGuardadas || [],
  })
  completando.value = false
  if (error) { evaluarError.value = error.message; return }
  participanteActual.value = { ...participanteActual.value, estado: 'completado', puntajeTotal: data.puntaje_total }
  const { data: parts } = await listParticipantes(asignacionParaParticipantes.value.id)
  participantesActuales.value = parts || []
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

/* ── Resultado / aprobación / plan de mejora ── */
const asignacionActual = ref(null)
const participantesResultado = ref([])
const pasosAprobacion = ref([])
const planMejora = ref([])
const archivoFirmado = ref(null)
const subiendoFirmado = ref(false)

async function abrirResultado(a) {
  modal.type = 'resultado'
  modal.data = a
  archivoFirmado.value = null
  const { data } = await getAsignacion(a.id)
  asignacionActual.value = data
  const [{ data: parts }, { data: pasos }, { data: plan }] = await Promise.all([
    listParticipantes(a.id), listPasosAprobacion(a.id), listPlanMejora(a.id),
  ])
  participantesResultado.value = parts || []
  pasosAprobacion.value = pasos || []
  planMejora.value = plan || []
  modal.open = true
}

function esPasoActivo(paso) {
  const pendientes = pasosAprobacion.value.filter((p) => p.estado === 'pendiente').sort((a, b) => a.orden - b.orden)
  return pendientes[0]?.id === paso.id
}

async function resolverPaso(paso, aprobado) {
  const comentario = aprobado ? '' : (prompt('Motivo de rechazo:') || '')
  if (!aprobado && !comentario.trim()) return
  await resolverPasoAprobacion(paso.id, { aprobado, aprobadorProfileId: currentUser.value?.id, comentario })
  const [{ data: pasos }, { data: asig }] = await Promise.all([listPasosAprobacion(asignacionActual.value.id), getAsignacion(asignacionActual.value.id)])
  pasosAprobacion.value = pasos || []
  asignacionActual.value = asig
  await Promise.all([cargarDetalle(), cargarEvaluaciones()])
}

const EMPTY_ACCION = { accion: '', responsable: '', fechaCompromiso: '' }
const nuevaAccion = reactive({ ...EMPTY_ACCION })
async function agregarAccionMejora() {
  if (!nuevaAccion.accion.trim()) return
  await crearAccionMejora(cooperativaId.value, asignacionActual.value.id, nuevaAccion)
  Object.assign(nuevaAccion, EMPTY_ACCION)
  const { data } = await listPlanMejora(asignacionActual.value.id)
  planMejora.value = data || []
}
async function cambiarEstadoAccion(acc, estado) {
  await actualizarEstadoAccionMejora(acc.id, estado)
  acc.estado = estado
}

function onArchivoFirmadoChange(e) { archivoFirmado.value = e.target.files?.[0] || null }
async function subirFirmado() {
  if (!archivoFirmado.value) return
  subiendoFirmado.value = true
  const { data, error } = await subirDocumentoFirmado(cooperativaId.value, asignacionActual.value.empleadoId, asignacionActual.value.id, archivoFirmado.value)
  subiendoFirmado.value = false
  if (error) return
  asignacionActual.value = { ...asignacionActual.value, documentoPath: data.documento_path, documentoNombre: data.documento_nombre }
}
async function verDocumentoFirmado() {
  if (!asignacionActual.value.documentoPath) return
  const { url } = await getUrlDescarga(asignacionActual.value.documentoPath)
  if (url) window.open(url, '_blank')
}

async function descargarInforme(a) {
  const { data: fullAsig } = await getAsignacion(a.id)
  const { data: parts } = await listParticipantes(a.id)
  const emp = empleados.value.find((e) => e.id === a.empleadoId)
  await exportInformeEvaluacion(fullAsig, evaluacionActual.value, secciones.value, parts || [], {
    name: emp ? nombreEmpleado(emp) : a.name,
    codigo: emp?.codigoInterno,
    departamento: emp?.dept,
    puesto: emp?.role,
  })
}
</script>

<style scoped>
.ep { display: flex; flex-direction: column; gap: 16px; }
.ep-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.section-subtitle { font-size: 16px; font-weight: 700; color: #133C65; margin: 2px 0; }
.dark .section-subtitle { color: #E2E8F0; }
.section-desc { font-size: 12.5px; color: #7A90A0; }
.ep-back { background: none; border: none; color: #133C65; font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 0 0 4px; }
.dark .ep-back { color: #93B8D8; }
.ep-back:hover { text-decoration: underline; }

.ep-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.ep-panel { display: flex; flex-direction: column; gap: 16px; }

.ep-puntaje-check { font-size: 13px; font-weight: 600; color: #C0392B; padding: 8px 12px; background: rgba(192,57,43,0.08); border-radius: 8px; width: fit-content; }
.ep-puntaje-check--ok { color: #1A6B42; background: rgba(26,145,82,0.08); }

.ep-checklist { max-height: 260px; overflow-y: auto; padding: 8px; border: 1px solid #E8EEF4; border-radius: 8px; }
.dark .ep-checklist { border-color: #3D5069; }
.ep-card-title { font-size: 13.5px; font-weight: 700; color: #133C65; margin: 0 0 4px; }
.dark .ep-card-title { color: #E2E8F0; }

.ep-progreso { font-size: 12.5px; color: #4A6070; background: #F8FAFC; padding: 8px 12px; border-radius: 8px; }
.dark .ep-progreso { color: #94A3B8; background: #162033; }

.ep-preguntas-form { display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 4px; }
.modal-box--evaluar .ep-preguntas-form { max-height: 52vh; }
.ep-seccion-titulo { font-size: 12.5px; font-weight: 700; color: #133C65; text-transform: uppercase; letter-spacing: 0.4px; margin: 8px 0 2px; }
.dark .ep-seccion-titulo { color: #93B8D8; }
.ep-pregunta-item { border: 1px solid #E8EEF4; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
.dark .ep-pregunta-item { border-color: #3D5069; }
.ep-pregunta-texto { font-size: 13px; font-weight: 600; color: #1A2B3C; margin: 0; }
.dark .ep-pregunta-texto { color: #E2E8F0; }
.ep-pregunta-item textarea, .ep-pregunta-item input, .ep-pregunta-item select {
  height: 32px; padding: 0 8px; border: 1.5px solid #D4E4F4; border-radius: 6px;
  font-size: 12.5px; font-family: inherit; background: #F8FAFC; color: #1A2B3C; outline: none;
}
.ep-pregunta-item textarea { height: auto; padding: 6px 8px; resize: vertical; }
.dark .ep-pregunta-item textarea, .dark .ep-pregunta-item input, .dark .ep-pregunta-item select { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.ep-puntaje-input { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #4A6070; }
.dark .ep-puntaje-input { color: #94A3B8; }
.ep-puntaje-input input { width: 80px; }
.ep-preview-pregunta { padding: 6px 0 6px 10px; border-left: 2px solid #E8EEF4; margin: 4px 0; }
.dark .ep-preview-pregunta { border-color: #3D5069; }

.ep-escala-block { border: 1px solid #E8EEF4; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
.dark .ep-escala-block { border-color: #3D5069; }
.ep-escala-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.ep-escala-valores { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; color: #1A2B3C; }
.dark .ep-escala-valores { color: #E2E8F0; }
.ep-escala-valores li { display: flex; align-items: center; gap: 8px; }
.ep-valor-quitar { background: none; border: none; color: #B8C4CE; cursor: pointer; display: flex; }
.ep-valor-quitar:hover { color: #C0392B; }
.ep-escala-add { display: flex; gap: 6px; align-items: center; }
.ep-escala-add input { height: 30px; padding: 0 8px; border: 1.5px solid #D4E4F4; border-radius: 6px; font-size: 12px; background: #F8FAFC; }
.dark .ep-escala-add input { background: #162033; border-color: #3D5069; color: #E2E8F0; }

.ep-resultado { font-size: 15px; font-weight: 700; color: #133C65; text-align: center; padding: 10px; background: #F8FAFC; border-radius: 8px; }
.dark .ep-resultado { color: #E2E8F0; background: #162033; }

.adjunto-actual { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 10px; border: 1px solid #E8EEF4; border-radius: 7px; background: #F8FAFC; margin-bottom: 6px; }
.dark .adjunto-actual { background: #162033; border-color: #3D5069; }
.adjunto-nombre { font-size: 12.5px; color: #133C65; cursor: pointer; text-decoration: underline; }
.dark .adjunto-nombre { color: #93B8D8; }

.req { color: #C0392B; }

/* ── Compartidas (tabla, badges, botones, modal) ── */
.data-card { background: white; border-radius: 12px; border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden; padding: 16px; }
.dark .data-card { background: #1D293D; border-color: #3D5069; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 9px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #7A90A0; border-bottom: 1px solid #E8EEF4; }
.dark .data-table th { border-color: #3D5069; color: #64748B; }
.data-table td { padding: 10px; font-size: 13px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #2A3B57; }
.empty-row { text-align: center; color: #B0C0D0; padding: 26px; font-size: 13px; }
.cell-actions { display: flex; gap: 4px; }
.cell-user { display: flex; align-items: center; gap: 8px; }
.cell-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; flex-shrink: 0; }

.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--red    { background: rgba(192,57,43,0.12); color: #C0392B; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.badge--blue   { background: rgba(19,60,101,0.1); color: #133C65; }
.dark .badge--yellow { background: rgba(251,191,36,0.18); color: #FBBF24; }
.dark .badge--green  { background: rgba(74,222,128,0.15); color: #4ADE80; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }
.dark .badge--blue   { background: rgba(96,165,250,0.18); color: #60A5FA; }

.action-btn { width: 26px; height: 26px; border-radius: 6px; border: none; background: none; color: #7A90A0; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: color 0.15s, background 0.15s; }
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }
.action-btn--red:hover { color: #C0392B; background: rgba(192,57,43,0.1); }

.btn-primary { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600; color: white; background: #133C65; border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.btn-primary:hover:not(:disabled) { background: #0D2A47; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary--danger { background: #C0392B; }
.btn-primary--danger:hover:not(:disabled) { background: #A5301F; }
.btn-outline { font-size: 13.5px; font-weight: 600; color: #133C65; background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.dark .btn-outline { color: #93B8D8; border-color: #3D5069; }
.btn-outline--sm { padding: 5px 10px; font-size: 12px; }
.btn-outline--danger { color: #C0392B; border-color: rgba(192,57,43,0.35); }
.btn-outline--danger:hover { background: rgba(192,57,43,0.08); }
.dark .btn-outline--danger { color: #E57368; border-color: rgba(229,115,104,0.4); }
.btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }

.filter-select { height: 36px; padding: 0 10px; border: 1.5px solid #D4E4F4; border-radius: 8px; font-size: 13px; font-family: inherit; background: white; color: #1A2B3C; cursor: pointer; }
.dark .filter-select { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

.exp-tab-item { text-align: left; padding: 8px 14px; border-radius: 8px; border: none; background: none; font-size: 12.5px; font-weight: 600; color: #4A6070; cursor: pointer; transition: all 0.15s; }
.dark .exp-tab-item { color: #94A3B8; }
.exp-tab-item--active { background: #133C65; color: white; }
.dark .exp-tab-item--active { background: #93B8D8; color: #0F1729; }

.exp-mini-list { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 280px; overflow-y: auto; }
.exp-mini-empty { font-size: 12px; color: #7A90A0; padding: 8px 2px; }
.exp-mini-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 4px; border-bottom: 1px solid #F0F4F8; font-size: 13px; color: #1A2B3C; }
.dark .exp-mini-item { border-color: #2A3B57; color: #E2E8F0; }
.exp-mini-item:last-child { border-bottom: none; }
.exp-mini-sub { font-size: 11.5px; color: #7A90A0; margin-top: 2px; }
.exp-hint { font-size: 11.5px; color: #7A90A0; margin: 2px 0; }

.form-section-title { font-size: 12.5px; font-weight: 700; color: #133C65; margin: 4px 0 2px; }
.dark .form-section-title { color: #E2E8F0; }
.modal-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.form-field { display: flex; flex-direction: column; gap: 4px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 12px; font-weight: 600; color: #4A6070; }
.dark .form-field label { color: #94A3B8; }
.form-field input, .form-field select, .form-field textarea {
  height: 36px; padding: 0 10px; border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13px; font-family: inherit; background: #F8FAFC; color: #1A2B3C; outline: none;
}
.form-field textarea { height: auto; padding: 8px 10px; resize: vertical; }
.dark .form-field input, .dark .form-field select, .dark .form-field textarea { background: #162033; border-color: #3D5069; color: #E2E8F0; }
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #133C65; background: white; }

.checkbox-inline label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #4A6070; cursor: pointer; }
.dark .checkbox-inline label { color: #94A3B8; }
.checkbox-group { display: flex; flex-direction: column; gap: 8px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #1A2B3C; cursor: pointer; padding: 4px 0; }
.dark .checkbox-item { color: #E2E8F0; }
.checkbox-item input { width: 15px; height: 15px; accent-color: #133C65; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,41,0.5); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
.modal-box { background: white; border-radius: 14px; padding: 26px; max-width: 480px; width: 100%; max-height: 88vh; overflow-y: auto; position: relative; }
.dark .modal-box { background: #1D293D; }
.modal-box--expediente { max-width: 620px; }
.modal-box--evaluar { max-width: 820px; max-height: 92vh; }

.ep-seccion-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin: 10px 0 14px; }
.modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #7A90A0; cursor: pointer; }
.modal-title { font-size: 17px; font-weight: 700; color: #133C65; margin-bottom: 4px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 12.5px; color: #7A90A0; margin-bottom: 16px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
