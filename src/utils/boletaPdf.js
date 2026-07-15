import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga la Boleta de Despacho en PDF para un pedido.
 *
 * @param {object} orden - Objeto de pedido devuelto por el backend
 *   (orderService.fetchOrderByNumber / fetchOrders). Debe incluir
 *   customerName, customerEmail, subtotal, lines, totalAmount,
 *   pointsRedeemed, pointsEarned, orderNumber.
 * @param {object} [datosLogistica] - Datos opcionales de logística
 *   (trackingCode, carrier, destinationAddress). Si no se entrega,
 *   se usan los datos de la propia orden (shippingAddress / trackingCode).
 */
export function generarBoletaPdf(orden, datosLogistica = {}) {
    if (!orden) return;

    const doc = new jsPDF();

    const direccion = datosLogistica.destinationAddress || orden.shippingAddress || 'No registrada';
    const tracking = datosLogistica.trackingCode || orden.trackingCode || 'Generado Post-Asignación';
    const transportista = datosLogistica.carrier || 'Asignación Manual';

    // 1. Título
    doc.setTextColor(180, 100, 255);
    doc.setFontSize(18);
    doc.text('SmartLogix - Boleta de Despacho', 14, 20);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);

    // 2. Datos del Cliente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Datos del Cliente', 14, 40);
    doc.setFontSize(10);
    doc.text(`Nombre: ${orden.customerName || 'No registrado'}`, 14, 48);
    doc.text(`Email: ${orden.customerEmail || 'No registrado'}`, 14, 54);

    // 3. Datos de Logística
    doc.setFontSize(12);
    doc.text('Hoja de Ruta y Logística', 110, 40);
    doc.setFontSize(10);
    doc.text(`Orden Origen: ${orden.orderNumber}`, 110, 48);
    doc.text(`Tracking: ${tracking}`, 110, 54);
    doc.text(`Transportista: ${transportista}`, 110, 60);

    // 4. Dirección de envío: en su propia línea de ancho completo, con
    // salto de línea automático para que no se superponga con logística.
    doc.setFont('helvetica', 'normal');
    const direccionLines = doc.splitTextToSize(`Dirección: ${direccion}`, 182);
    doc.text(direccionLines, 14, 66);
    const direccionBlockHeight = direccionLines.length * 5;

    // 5. Tabla de Productos
    const tableData = orden.lines ? orden.lines.map(line => {
        const qty = Number(line.quantity) || 0;
        const price = Number(line.unitPrice) || 0;
        return [
            line.sku || 'N/A',
            qty,
            `$${price.toLocaleString('es-CL')}`,
            `$${(qty * price).toLocaleString('es-CL')}`
        ];
    }) : [];

    autoTable(doc, {
        startY: 70 + direccionBlockHeight,
        head: [['SKU Producto', 'Cant', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        headStyles: { fillColor: [43, 20, 60] },
    });

    // 5. Totales
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Subtotal: $${Number(orden.subtotal || 0).toLocaleString('es-CL')}`, 140, finalY);

    let offsetY = finalY + 6;
    if (orden.pointsRedeemed > 0) {
        doc.setTextColor(138, 43, 226);
        doc.text(`LogixPoints Desc: -${orden.pointsRedeemed} pts`, 140, offsetY);
        offsetY += 6;
    }

    if (orden.pointsEarned > 0) {
        doc.setTextColor(40, 167, 69);
        doc.text(`LogixPoints Gana: +${orden.pointsEarned} pts`, 140, offsetY);
        offsetY += 6;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${Number(orden.totalAmount || 0).toLocaleString('es-CL')}`, 140, offsetY + 4);

    // 6. Descargar el archivo
    doc.save(`Boleta_SmartLogix_${orden.orderNumber}.pdf`);
}
