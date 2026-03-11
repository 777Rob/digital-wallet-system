import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Anchor, Stack, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useRegisterMutation } from '../hooks/mutations/useAuthMutations';
import { IconWallet } from '@tabler/icons-react';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (val: string) => (val.trim().length > 0 ? null : t('required')),
      email: (val: string) => (/^\S+@\S+$/.test(val) ? null : t('invalidEmail')),
      password: (val: string) => (val.length < 6 ? t('required') : null),
      confirmPassword: (val: string, values: { password?: string }) => (val !== values.password ? t('passwordsDontMatch') : null),
    },
  });

  const mutation = useRegisterMutation();

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Registration successful! Please login.',
          color: 'green',
        });
        navigate('/login');
      },
      onError: (error: Error | AxiosError) => {
        let message = 'Registration failed';
        if ('isAxiosError' in error && error.response?.data) {
          message = (error.response.data as any).message || message;
        }
        notifications.show({
          title: 'Error',
          message,
          color: 'red',
        });
      }
    });
  });

  return (
    <Container size={420} w="100%">
      <Stack align="center" mb="lg">
        <ThemeIcon size={64} radius="xl" variant="light" color="green">
          <IconWallet size={32} />
        </ThemeIcon>
        <Title ta="center">{t('register')}</Title>
      </Stack>
      
      <Paper withBorder shadow="xl" p={40} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label={t('name')}
              placeholder="John Doe"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label={t('email')}
              placeholder="hello@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label={t('password')}
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label={t('confirmPassword')}
              placeholder="Confirm password"
              required
              {...form.getInputProps('confirmPassword')}
            />
            <Button fullWidth mt="xl" type="submit" loading={mutation.isPending}>
              {t('register')}
            </Button>
          </Stack>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt={20}>
          <Anchor component={Link} to="/login" size="sm" fw={500}>
            {t('haveAccount')}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

