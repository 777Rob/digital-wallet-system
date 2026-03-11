import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Anchor, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useRegisterMutation } from '../hooks/mutations/useAuthMutations';

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
    <Container size={420} my={40}>
      <Title ta="center">{t('register')}</Title>
      
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
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
        <Text c="dimmed" size="sm" ta="center" mt={15}>
          <Anchor component={Link} to="/login" size="sm">
            {t('haveAccount')}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
