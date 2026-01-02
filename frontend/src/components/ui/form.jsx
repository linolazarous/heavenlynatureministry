import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

const FormFieldContext = React.createContext({});
const FormItemContext = React.createContext({});

const FormField = React.forwardRef(({
  control,
  name,
  rules,
  defaultValue,
  shouldUnregister,
  ...props
}, ref) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller
        ref={ref}
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        shouldUnregister={shouldUnregister}
        {...props}
      />
    </FormFieldContext.Provider>
  );
});
FormField.displayName = "FormField";

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef(({
  className,
  layout = "vertical",
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const id = React.useId();

  const layoutClasses = {
    vertical: "space-y-2",
    horizontal: "grid grid-cols-1 sm:grid-cols-4 gap-4 items-start",
    inline: "flex flex-row items-center gap-3",
  };

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          layoutClasses[layout] || layoutClasses.vertical,
          disabled && "opacity-60 pointer-events-none",
          className
        )}
        data-required={required}
        data-disabled={disabled}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({
  className,
  required = false,
  optional = false,
  tooltip,
  ...props
}, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "text-sm font-medium text-gray-900 dark:text-gray-100",
        error && "text-red-600 dark:text-red-400",
        "flex items-center gap-1.5",
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      {props.children}
      {required && (
        <span className="text-red-500 dark:text-red-400" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
          (Optional)
        </span>
      )}
      {tooltip && (
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="More information"
          onClick={tooltip.onClick}
        >
          {tooltip.icon || "ℹ️"}
        </button>
      )}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      aria-errormessage={error ? formMessageId : undefined}
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "focus-visible:ring-offset-2",
        error && "border-red-500 dark:border-red-400",
        className
      )}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef(({
  className,
  variant = "default",
  ...props
}, ref) => {
  const { formDescriptionId } = useFormField();

  const variantClasses = {
    default: "text-gray-600 dark:text-gray-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-xs",
        variantClasses[variant] || variantClasses.default,
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef(({
  className,
  children,
  asChild = false,
  ...props
}, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  if (asChild) {
    return (
      <Slot
        ref={ref}
        id={formMessageId}
        className={cn(
          "text-sm font-medium text-red-600 dark:text-red-400",
          "animate-in fade-in-50 duration-200",
          className
        )}
        {...props}
      >
        {body}
      </Slot>
    );
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium text-red-600 dark:text-red-400",
        "animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// Helper components
const FormGroup = React.forwardRef(({ className, title, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "space-y-4 border-l-2 border-blue-200 dark:border-blue-800 pl-4",
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      {props.children}
    </div>
  );
});
FormGroup.displayName = "FormGroup";

const FormActions = React.forwardRef(({ className, align = "end", ...props }, ref) => {
  const alignClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap gap-2",
        alignClasses[align] || alignClasses.end,
        "mt-6 pt-4 border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
});
FormActions.displayName = "FormActions";

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormGroup,
  FormActions,
  useFormField,
};
