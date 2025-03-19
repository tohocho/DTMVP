import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
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
  fechaNacimiento: string;
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
  // Properties
  showSearchResults: boolean = false;
  searchNSS: string = '';
  patientData: Patient | null = null;
  estudios: Estudio[] = [];
  showQR: boolean = false;
  qrData: string = '';
  qrEstudiosData: string = '';
  isNewPatientFormVisible: boolean = false;
  newPatient: Patient = {
    numeroSeguridadSocial: '',
    numeroExpediente: '',
    curp: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    escolaridad: '',
    estadoCivil: '',
    sexo: '',
    fechaNacimiento: '',
    tipoSangre: ''
  };

  constructor(private http: HttpClient) {}

  // Methods
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
    let formatted = key.charAt(0).toUpperCase() + key.slice(1);
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
        fechaNacimiento: this.patientData.fechaNacimiento,
        tipoSangre: this.patientData.tipoSangre,
      });

      this.qrEstudiosData = JSON.stringify(this.estudios);
      this.showQR = true;
    }
  }

  closeQR() {
    this.showQR = false;
  }

  downloadQR() {
    const qrElements = document.querySelectorAll('qrcode canvas');
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('es-ES', { month: 'short' });
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    qrElements.forEach((qrElement, index) => {
      const canvas = qrElement as HTMLCanvasElement;
      const link = document.createElement('a');
      const qrType = index === 0 ? 'DatosPaciente' : 'EstudiosPaciente';
      link.download = `QR_${this.patientData?.nombre}_${this.patientData?.numeroSeguridadSocial}_${qrType}_${formattedDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  showNewPatientForm() {
    this.isNewPatientFormVisible = true;
    this.showSearchResults = false;
    this.patientData = null;
    this.searchNSS = '';
    this.estudios = [];
  }

  cancelNewPatient() {
    this.isNewPatientFormVisible = false;
    this.newPatient = {
      numeroSeguridadSocial: '',
      numeroExpediente: '',
      curp: '',
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      escolaridad: '',
      estadoCivil: '',
      sexo: '',
      fechaNacimiento: '',
      tipoSangre: ''
    };
  }
  submitNewPatient() {
    console.log(this.newPatient);
    this.http.post('http://localhost:8080/pacientes/guardar', this.newPatient)
      .subscribe({
        next: (response) => {
          alert('Paciente registrado exitosamente');
          this.isNewPatientFormVisible = false;
          this.cancelNewPatient();
        },
        error: (error) => {
          console.error('Error al registrar paciente:', error);
          alert('Error al registrar el paciente');
        }
      });
  }

}
