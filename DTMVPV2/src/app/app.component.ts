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

interface RespuestaAPI {
  datosEncriptados: {
    encrypted_data: string;
  };
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
      // Primero obtener los datos encriptados
      this.http.get<RespuestaAPI>(`http://localhost:8080/pacientes/encryptPaciente/${this.patientData.numeroSeguridadSocial}`)
        .subscribe({
          next: (encryptedData) => {
            // Generar QR con los datos encriptados
            this.qrData = JSON.stringify({
              datosEncriptados: encryptedData
            });
            this.showQR = true;
          },
          error: (error) => {
            console.error('Error al obtener datos encriptados:', error);
            alert('Error al generar el código QR');
          }
        });

        this.http.get<RespuestaAPI>(`http://localhost:8080/pacientes/encryptEstudios/${this.patientData.numeroSeguridadSocial}`)
        .subscribe({
          next: (encryptedDataEstudios) => { 
            this.qrEstudiosData = JSON.stringify(encryptedDataEstudios);
            console.log('Datos que deberian estar en el QR:', this.qrEstudiosData);
            this.showQR = true;
          }
        });

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

  cleanNewPatient() {
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
    const nss = this.newPatient.numeroSeguridadSocial;
    
    // Primero verificar si el paciente existe
    this.http.get(`http://localhost:8080/pacientes/${nss}`).subscribe({
      next: (existingPatient) => {
        alert('Ya existe un paciente con este número de seguridad social');
      this.cleanNewPatient();
      },
      error: (error) => {
        // Si no existe el paciente, proceder a guardarlo
        if (error.status === 404) {
          this.http.post('http://localhost:8080/pacientes/pacienteGuardar', this.newPatient)
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
        } else {
          console.error('Error al verificar paciente:', error);
          alert('Error al verificar el paciente');
        }
      }
    });
  }

}
