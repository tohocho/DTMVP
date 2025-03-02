import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';

interface Patient {
  numeroSeguridadSocial: string;
  numeroExpediente: string;
  curp: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  escolaridad: string;
  estadoCivil: string;
  sexo: string;
  anioNacimiento: number;
  tipoSangre: string;
  [key: string]: string | number;
}
interface Estudio {
  identificadorEstudio: string;
  unidadMedicaEnvia: string;
  unidadMedicaRecibe: string;
  medicoEnvia: string;
  nombreEstudio: string;
  notasEstudio: string;
  fechaEnvio: string;
  paciente: {
    numeroSeguridadSocial: string;
  };
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, QRCodeComponent]
})
export class AppComponent {
  showSearchResults: boolean = false;
  searchNSS: string = '';
  patientData: Patient | null = null;
  estudios: Estudio[] = [];
  showQR: boolean = false;
  qrData: string = '';
  qrEstudiosData: string = '';

  constructor(private http: HttpClient) {}

  getPatientKeys(): string[] {
    return Object.keys(this.patientData || {});
  }

  searchPatient() {
    if (this.searchNSS) {
      this.http.get<Patient>(`http://localhost:8080/pacientes/${this.searchNSS}`)
        .subscribe({
          next: (response) => {
            this.patientData = response;
            this.showSearchResults = true;
            // Buscar estudios del paciente
            this.searchEstudios(this.searchNSS);
          },
          error: (error) => {
            console.error('Error al buscar paciente:', error);
            this.patientData = null;
            this.showSearchResults = false;
            this.estudios = [];
            alert('No se encontró el paciente');
          }
        });
    }
  }

  searchEstudios(nss: string) {
    this.http.get<Estudio[]>(`http://localhost:8080/estudios/paciente/${nss}`)
      .subscribe({
        next: (response) => {
          this.estudios = response;
        },
        error: (error) => {
          this.estudios = [];
        }
      });
  }

  formatKey(key: string): string {
    // Capitalizar primera letra
    let formatted = key.charAt(0).toUpperCase() + key.slice(1);
    // Insertar espacios antes de las mayúsculas
    return formatted.replace(/([A-Z])/g, ' $1').trim();
  }

  returnToForm() {
    this.showSearchResults = false;
    this.patientData = null;
    this.searchNSS = '';
    this.estudios = [];
  }

  generateQR() {
    if (this.patientData) {
      // QR para datos del paciente
      this.qrData = JSON.stringify({
        nss: this.patientData.numeroSeguridadSocial,
        nombre: this.patientData.nombre,
        primerApellido: this.patientData.primerApellido,
        segundoApellido: this.patientData.segundoApellido,
        expediente: this.patientData.numeroExpediente,
        sexo: this.patientData.sexo,
        curp: this.patientData.curp,
        escolaridad: this.patientData.escolaridad,
        estadoCivil: this.patientData.estadoCivil,
        anioNacimiento: this.patientData.anioNacimiento,
        tipoSangre: this.patientData.tipoSangre,
      });

      // QR para estudios del paciente
      this.qrEstudiosData = JSON.stringify(this.estudios);
      this.showQR = true;
    }
  }

  closeQR() {
    this.showQR = false;
  }

  downloadPatientInfo() {
    if (this.patientData) {
      this.http.get(`http://localhost:8080/pacientes/info-pdf/${this.patientData.numeroSeguridadSocial}`, 
      //this.http.get(`http://localhost:8080/pacientes/encrypted-info/${this.patientData.numeroSeguridadSocial}`, 
      { responseType: 'blob' })
        .subscribe({
          next: (response) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = new Date();
            const day = today.getDate();
            const month = today.toLocaleString('es-ES', { month: 'short' });
            const year = today.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;
            console.log(formattedDate);
            link.download = `Paciente_${this.patientData?.nombre}_${this.patientData?.numeroSeguridadSocial}_${formattedDate}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Error al descargar el PDF:', error);
            alert('Error al descargar la información del paciente');
          }
        });
    }
  }
}
