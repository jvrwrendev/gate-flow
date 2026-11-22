import { useState } from 'react';
import { Alert, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Trash2, Upload } from 'lucide-react-native';
import { StyledView, StyledText, StyledPressable } from '@/src/components/ui/core';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (uri: string | undefined) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

function isAllowedImage(asset: ImagePicker.ImagePickerAsset) {
  const mimeOk = !asset.mimeType || ALLOWED_MIME_TYPES.includes(asset.mimeType.toLowerCase());
  const name = asset.fileName || asset.uri || '';
  const ext = name.split('?')[0].split('.').pop()?.toLowerCase();
  const extOk = !ext || ALLOWED_EXTENSIONS.includes(ext);
  // If we have either a clear mime type or extension, validate it; otherwise allow (native picker usually returns images).
  if (asset.mimeType || asset.fileName) return mimeOk && extOk;
  return true;
}

export function ImageUploadField({ label, value, onChange, error, helperText, className }: ImageUploadFieldProps) {
  const [busy, setBusy] = useState(false);

  const handlePick = async (source: 'library' | 'camera') => {
    setBusy(true);
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera permission needed', 'Please allow camera access to capture a vehicle image.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Photo permission needed', 'Please allow photo library access to upload a vehicle image.');
          return;
        }
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (!isAllowedImage(asset)) {
        Alert.alert('Unsupported format', 'Please select a JPG, JPEG, or PNG image.');
        return;
      }
      onChange(asset.uri);
    } catch {
      Alert.alert('Upload failed', 'Unable to select image. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StyledView className={cn('gap-2', className)}>
      {label ? <StyledText className="text-sm font-medium text-foreground">{label}</StyledText> : null}

      {value ? (
        <StyledView className="overflow-hidden rounded-xl border border-border bg-muted/20">
          <Image source={{ uri: value }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
          <StyledView className="flex-row gap-2 border-t border-border p-3">
            <Button variant="outline" size="sm" className="flex-1" onPress={() => handlePick('library')} disabled={busy}>
              <Upload size={16} color="#102a2d" />
              <StyledText className="ml-2 text-[15px] font-medium text-foreground">Replace</StyledText>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onPress={() => onChange(undefined)} disabled={busy}>
              <Trash2 size={16} color="#dc2626" />
              <StyledText className="ml-2 text-[15px] font-medium text-destructive">Remove</StyledText>
            </Button>
          </StyledView>
        </StyledView>
      ) : (
        <StyledView className="rounded-xl border border-dashed border-input bg-muted/20 px-4 py-5">
          <StyledView className="items-center gap-2">
            <StyledView className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <ImageIcon size={22} color="#0f766e" />
            </StyledView>
            <StyledText className="text-sm font-medium text-foreground">Upload vehicle image</StyledText>
            <StyledText className="text-center text-xs text-muted-foreground">
              JPG, JPEG, or PNG. You can choose from gallery or take a photo.
            </StyledText>
          </StyledView>
          <StyledView className={cn('mt-4 gap-2', Platform.OS === 'web' ? '' : 'sm:flex-row')}>
            <Button variant="outline" className="flex-1" onPress={() => handlePick('library')} disabled={busy}>
              <Upload size={16} color="#102a2d" />
              <StyledText className="ml-2 text-[15px] font-medium text-foreground">Choose from gallery</StyledText>
            </Button>
            <Button variant="outline" className="flex-1" onPress={() => handlePick('camera')} disabled={busy}>
              <Camera size={16} color="#102a2d" />
              <StyledText className="ml-2 text-[15px] font-medium text-foreground">Take photo</StyledText>
            </Button>
          </StyledView>
        </StyledView>
      )}

      {error ? <StyledText className="text-xs text-destructive">{error}</StyledText> : null}
      {!error && helperText ? <StyledText className="text-xs text-muted-foreground">{helperText}</StyledText> : null}
    </StyledView>
  );
}