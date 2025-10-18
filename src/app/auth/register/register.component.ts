import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';
import { RegisterDto } from '../dto/register.dto';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  // 🚀 SIGNALS - Loading and error states
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // 📋 Reactive form for registration
  registerForm: FormGroup = this.fb.group({
    firstname: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { 
    validators: this.passwordMatchValidator // Custom validator for password confirmation
  });

  /**
   * Custom validator to check if password and confirmPassword match
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const registerData: RegisterDto = {
        firstname: this.registerForm.value.firstname,
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toastr.success(
            `Welcome ${registerData.firstname}! Your account has been created successfully.`,
            'Registration Successful'
          );
          // Redirect to login page after successful registration
          this.router.navigate([APP_ROUTES.login]);
        },
        error: (error) => {
          this.loading.set(false);
          console.error('Registration error - Full error object:', error);
          console.error('Registration error - Status:', error.status);
          console.error('Registration error - Status Text:', error.statusText);
          console.error('Registration error - Error body:', error.error);
          console.error('Registration error - Message:', error.message);
          
          let errorMessage = 'Registration failed. Please try again.';
          
          // More detailed error handling
          if (error.status === 0) {
            errorMessage = 'Network error: Cannot connect to server. Please check your internet connection.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid registration data. Please check your information.';
          } else if (error.status === 409) {
            errorMessage = 'Email already exists. Please use a different email address.';
          } else if (error.status === 404) {
            errorMessage = 'Registration endpoint not found. Please contact support.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later or contact support.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }
          
          // Add status code to error message for debugging
          errorMessage += ` (Status: ${error.status})`;
          
          this.error.set(errorMessage);
          this.toastr.error(errorMessage, 'Registration Error');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Check if a form field has errors and should show error message
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address.';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters.`;
      }
    }
    
    // Check form-level password mismatch error
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match.';
    }
    
    return '';
  }
}