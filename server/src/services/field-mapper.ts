import type { FieldMapping } from '@shared/schema';

export class FieldMapperService {
  static applyMappings(formData: Record<string, any>, mappings: FieldMapping[]): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    for (const mapping of mappings) {
      const value = formData[mapping.squarespaceField];
      
      if (value !== undefined && value !== null && value !== '') {
        let transformedValue = value;
        
        // Apply transformation rules
        switch (mapping.transformRule) {
          case 'uppercase':
            transformedValue = String(value).toUpperCase();
            break;
          case 'lowercase':
            transformedValue = String(value).toLowerCase();
            break;
          case 'parseInt':
            transformedValue = parseInt(String(value), 10);
            if (isNaN(transformedValue)) {
              transformedValue = undefined;
            }
            break;
          case 'parseFloat':
            transformedValue = parseFloat(String(value));
            if (isNaN(transformedValue)) {
              transformedValue = undefined;
            }
            break;
          case 'trim':
            transformedValue = String(value).trim();
            break;
        }
        
        if (transformedValue !== undefined) {
          mapped[mapping.omegaField] = transformedValue;
        }
      }
    }
    
    return mapped;
  }

  static validateRequiredFields(formData: Record<string, any>, mappings: FieldMapping[]): string[] {
    const errors: string[] = [];
    
    for (const mapping of mappings) {
      if (mapping.isRequired) {
        const value = formData[mapping.squarespaceField];
        if (value === undefined || value === null || value === '') {
          errors.push(`Required field '${mapping.squarespaceField}' is missing or empty`);
        }
      }
    }
    
    return errors;
  }

  static extractCustomerName(formData: Record<string, any>): { firstName: string; lastName: string; fullName: string } {
    let firstName = '';
    let lastName = '';
    let fullName = '';
    
    if (formData.firstName && formData.lastName) {
      firstName = formData.firstName;
      lastName = formData.lastName;
      fullName = `${firstName} ${lastName}`.trim();
    } else if (formData.name || formData.fullName) {
      fullName = formData.name || formData.fullName;
      const nameParts = fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else if (formData.customerName) {
      fullName = formData.customerName;
      const nameParts = fullName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    return { firstName, lastName, fullName };
  }
}
