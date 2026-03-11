import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Anchor, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';

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
      confirmPassword: (val: string, values: any) => (val !== values.password ? t('passwordsDontMatch') : null),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const response = await apiClient.post('/register', values);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Registration successful! Please login.',
        color: 'green',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Registration failed',
        color: 'red',
      });
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center">{t('register')}</Title>
      
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit((values: any) => mutation.mutate(values))}>
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
        <Text c="dimmed" size="sm" ta="center" mt={15}>
          <Anchor component={Link} to="/login" size="sm">
            {t('haveAccount')}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
