class FlowChartEditor {
    constructor() {
        this.nodes = [];
        this.connections = [];
        this.selectedNodes = [];
        this.connectMode = false;
        this.currentShape = 'rectangle';
        
        this.canvas = document.getElementById('canvas');
        this.trashBin = document.getElementById('trashBin');
        this.addNodeBtn = document.getElementById('addNodeBtn');
        this.connectNodesBtn = document.getElementById('connectNodesBtn');
        this.shapeSelector = document.getElementById('shapeSelector');

        this.initEventListeners();
    }

    initEventListeners() {
        this.addNodeBtn.addEventListener('click', () => this.addNode());
        this.connectNodesBtn.addEventListener('click', () => this.toggleConnectMode());
        this.canvas.addEventListener('mousemove', (e) => this.handleNodeDrag(e));
        this.canvas.addEventListener('mouseup', () => this.stopNodeDrag());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Shape Selector Event Listeners
        this.shapeSelector.addEventListener('click', (e) => {
            const shapeOption = e.target.closest('.shape-option');
            if (shapeOption) {
                this.currentShape = shapeOption.dataset.shape;
            }
        });

        // Trash Bin Event Listeners
        this.trashBin.addEventListener('dragover', this.handleDragOver.bind(this));
        this.trashBin.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.trashBin.addEventListener('drop', this.handleDrop.bind(this));
    }

    addNode() {
        const node = document.createElement('div');
        node.classList.add('node', `node-${this.currentShape}`);
        node.draggable = true;
        node.dataset.id = `node-${Date.now()}`;
        node.dataset.shape = this.currentShape;
        node.textContent = `Nodo ${this.nodes.length + 1}`;
        node.style.left = `${Math.random() * (this.canvas.clientWidth - 100)}px`;
        node.style.top = `${Math.random() * (this.canvas.clientHeight - 50)}px`;
        
        node.addEventListener('mousedown', (e) => this.startNodeDrag(e, node));
        node.addEventListener('dblclick', () => this.editNodeName(node));
        node.addEventListener('dragstart', this.handleDragStart.bind(this));
        
        this.canvas.appendChild(node);
        this.nodes.push(node);
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
    }

    handleDragOver(e) {
        e.preventDefault();
        this.trashBin.classList.add('drag-over');
    }

    handleDragLeave(e) {
        this.trashBin.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const nodeId = e.dataTransfer.getData('text/plain');
        this.deleteNode(nodeId);
        this.trashBin.classList.remove('drag-over');
    }

    deleteNode(nodeId) {
        const nodeToDelete = this.nodes.find(n => n.dataset.id === nodeId);
        if (nodeToDelete) {
            // Remove node from canvas and nodes array
            this.canvas.removeChild(nodeToDelete);
            this.nodes = this.nodes.filter(n => n.dataset.id !== nodeId);

            // Remove associated connections
            this.connections = this.connections.filter(conn => {
                if (conn.start === nodeId || conn.end === nodeId) {
                    this.canvas.removeChild(conn.element);
                    return false;
                }
                return true;
            });
        }
    }

    startNodeDrag(e, node) {
        this.draggedNode = node;
        this.offsetX = e.clientX - node.offsetLeft;
        this.offsetY = e.clientY - node.offsetTop;
    }

    handleNodeDrag(e) {
        if (this.draggedNode) {
            const x = e.clientX - this.offsetX;
            const y = e.clientY - this.offsetY;
            this.draggedNode.style.left = `${x}px`;
            this.draggedNode.style.top = `${y}px`;
            this.redrawConnections();
        }
    }

    stopNodeDrag() {
        this.draggedNode = null;
    }

    toggleConnectMode() {
        this.connectMode = !this.connectMode;
        this.selectedNodes = [];
        this.connectNodesBtn.textContent = this.connectMode ? 'Cancelar Conexión' : 'Conectar Nodos';
    }

    handleCanvasClick(e) {
        const clickedNode = e.target.closest('.node');
        
        if (this.connectMode) {
            if (clickedNode && !this.selectedNodes.includes(clickedNode)) {
                clickedNode.classList.add('selected');
                this.selectedNodes.push(clickedNode);

                if (this.selectedNodes.length === 2) {
                    this.connectSelectedNodes();
                }
            }
        }
    }

    connectSelectedNodes() {
        if (this.selectedNodes.length === 2) {
            const [startNode, endNode] = this.selectedNodes;
            
            const connection = this.drawConnection(startNode, endNode);
            this.connections.push({
                start: startNode.dataset.id,
                end: endNode.dataset.id,
                element: connection
            });

            // Reset selection
            this.selectedNodes.forEach(node => node.classList.remove('selected'));
            this.selectedNodes = [];
            this.connectMode = false;
            this.connectNodesBtn.textContent = 'Conectar Nodos';
        }
    }

    drawConnection(startNode, endNode) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('connector');
        svg.style.width = `${this.canvas.clientWidth}px`;
        svg.style.height = `${this.canvas.clientHeight}px`;
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', startNode.offsetLeft + startNode.offsetWidth / 2);
        line.setAttribute('y1', startNode.offsetTop + startNode.offsetHeight / 2);
        line.setAttribute('x2', endNode.offsetLeft + endNode.offsetWidth / 2);
        line.setAttribute('y2', endNode.offsetTop + endNode.offsetHeight / 2);
        line.setAttribute('stroke', '#333');
        line.setAttribute('stroke-width', '2');

        svg.appendChild(line);
        this.canvas.appendChild(svg);
        return svg;
    }

    redrawConnections() {
        this.connections.forEach(conn => {
            const startNode = this.nodes.find(n => n.dataset.id === conn.start);
            const endNode = this.nodes.find(n => n.dataset.id === conn.end);
            
            this.canvas.removeChild(conn.element);
            
            const newConnection = this.drawConnection(startNode, endNode);
            conn.element = newConnection;
        });
    }

    editNodeName(node) {
        const modal = document.createElement('div');
        modal.classList.add('edit-modal');
        modal.innerHTML = `
            <h3>Editar Nombre del Nodo</h3>
            <input type="text" id="nodeNameInput" value="${node.textContent}">
            <button id="saveNodeName">Guardar</button>
            <button id="cancelNodeName">Cancelar</button>
        `;
        
        document.body.appendChild(modal);
        const input = modal.querySelector('#nodeNameInput');
        const saveBtn = modal.querySelector('#saveNodeName');
        const cancelBtn = modal.querySelector('#cancelNodeName');

        input.select();

        saveBtn.addEventListener('click', () => {
            node.textContent = input.value;
            document.body.removeChild(modal);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}

new FlowChartEditor();