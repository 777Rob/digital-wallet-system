import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Anchor,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../hooks/mutations/useAuthMutations";
import { extractErrorMessage } from "../utils/errorMessage";

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (val: string) => (val.trim().length > 0 ? null : t("required")),
      email: (val: string) =>
        /^\S+@\S+$/.test(val) ? null : t("invalidEmail"),
      password: (val: string) => (val.length < 6 ? t("required") : null),
      confirmPassword: (val: string, values: { password?: string }) =>
        val !== values.password ? t("passwordsDontMatch") : null,
    },
  });

  const mutation = useRegisterMutation();

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: t("success"),
          message: t("registrationSuccess"),
          color: "green",
        });
        navigate("/login");
      },
      onError: (error) => {
        notifications.show({
          title: t("error"),
          message: extractErrorMessage(error, t("registrationFailed")),
          color: "red",
        });
      },
    });
  });

  return (
    <Container size={420} w="100%">
      <Paper withBorder shadow="xl" p={40} radius="md">
        <Title ta="center" order={2} mt="md" mb="xl">
          {t("createAccount")}
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label={t("name")}
              placeholder={t("namePlaceholder")}
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              required
              {...form.getInputProps("password")}
            />
            <PasswordInput
              label={t("confirmPassword")}
              placeholder={t("confirmPasswordPlaceholder")}
              required
              {...form.getInputProps("confirmPassword")}
            />
            <Button
              fullWidth
              mt="xl"
              type="submit"
              color="green"
              loading={mutation.isPending}
            >
              {t("register")}
            </Button>
          </Stack>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt={20}>
          <Anchor component={Link} to="/login" size="sm" fw={500}>
            {t("haveAccount")}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
