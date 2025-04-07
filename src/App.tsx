import { useCallback, useState } from 'react';
import './App.css';


/* ============================ Началььные значения ============================ */
const InitModel: Model = {
  paramValues: [
    {
      paramId: 1,
      value: "повседневное"
    },
    {
      paramId: 2,
      value: "макси"
    }
  ]
};

const initParams: Param[] = [
  {
    id: 1,
    name: "Назначение",
    type: "string"
  },
  {
    id: 2,
    name: "Длина",
    type: "string"
  }
];

/* ============================ Главная часть, компоненты ============================ */

/* <----- Компонент приложения-----> */
function App() {
  const { addParam, deleteParam, params, updateParam } = useParamEditor(InitModel, initParams);

  return (
    <div className='c-app'>
      <div className='l-two-columns'>
        <NewParamForm addParam={addParam} />
        <ParamList
          items={params}
          updateParam={updateParam}
          deleteParam={deleteParam}
        />
      </div>
    </div>
  )
}

/* <----- Компонент добавления нового параметра -----> */
function NewParamForm({ addParam }: NewParamFormProps) {
  const [type, setType] = useState<ParamType>("string");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const types: ParamTypes = ["string", "number", "select"];

  const callBacks = {
    handleTypeChange: useCallback((type: ParamType) => {
      setType(type);
      setValue("");
    }, []),

    handleNameChange: useCallback((name: string) => {
      setName(name);
    }, []),

    handleValueChange: useCallback((value: string) => {
      setValue(value);
    }, []),

    submit: useCallback(() => {
      addParam({ id: makeId(), name, type, value })
    }, [name, value, type, addParam]),
  };

  const paramIsValid = () => {
    return Boolean(
      !name.trim() || !value.trim() || type === "select"
    );
  };

  return (
    <div className='l-container'>
      <div className='c-list'>
        <label>
          Type:<br />
          <select value={type} onChange={(e) => callBacks.handleTypeChange(e.target.value as ParamType)}>
            {types.map((type, i) => (
              <option key={i} value={type}>
                {type[0].toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <>
          <Input name="Name"
            value={name}
            onChangeCb={callBacks.handleNameChange}
          />
          {type === "select" ? (
            <Input name='Value'
              value={"только string по тз"}
              readOnly
            />
          ) : (
            <Input name="Value"
              type={type}
              value={value}
              onChangeCb={callBacks.handleValueChange} />
          )}
        </>
      </div>
      <button onClick={callBacks.submit}
        disabled={paramIsValid()} >
        Добавить
      </button>
    </div>
  );
};

/* <----- Компонент вывода списка параметров -----> */
function ParamList({ items, updateParam, deleteParam }: ParamListProps) {
  const callbacks = {
    logButtonClick: useCallback(() => {
      console.log(items);
    }, [items]),
  };

  return (
    <div className='l-container'>
      <div className='c-list'>
        {items.map(item => (
          <div className='c-item' key={item.id}>
            <Input
              name={item.name}
              type={item.type}
              value={item.value}
              onChange={e => updateParam(item.id, e.target.value)} />
            <button
              onClick={() => deleteParam(item.id)}
              className='c-item__button'>
              x
            </button>
          </div>
        ))}
      </div>
      <button className='c-log-button' onClick={callbacks.logButtonClick}>
        Просмотреть в консоли
      </button>
    </div>
  );
}

/* <----- Компонент ввода для изменений и добавлений значений параметров -----> */
function Input({ name, onChangeCb, ...props }: InputProps) {
  return (
    <label>
      {name}:<br />
      <input
        maxLength={20}
        onChange={onChangeCb ? (e) => onChangeCb(e.target.value) : undefined}
        {...props}
      />
    </label>
  );
}

/* ============================ Хуки, функции, классы ============================ */

/**
    * Хук вместо state manager, тк все в 1 файле
    * @param model - модель, хранящая значения параметров
    * @param initialParams - массив параметров без их значений
    * @returns объект со списком параметров и инструментов для работы с ним
    */
export const useParamEditor = (model: Model, initialParams: Param[]) => {
  const [params, setParams] = useState(() => {
    const values = model.paramValues;
    const params: EditorParam[] = [];

    initialParams.forEach((param) => {
      const paramValue = values.find(v => v.paramId === param.id);
      if (paramValue) {
        params.push({
          id: param.id,
          name: param.name,
          type: param.type,
          value: paramValue.value,
        });
      }
    });

    return params;
  });

  const addParam = (param: EditorParam) => {
    setParams([...params, param]);
  };

  const deleteParam = (paramId: EditorParam["id"]) => {
    setParams(params.filter(param => param.id !== paramId));
  };

  const updateParam = (paramId: EditorParam["id"], value: EditorParam["value"]) => {
    setParams(
      params.map(param => param.id === paramId ? { ...param, value } : param)
    );
  };

  return {
    params,
    addParam,
    deleteParam,
    updateParam,
  };
};

/**
 * Создание случайного, но не уникального числа, но здесь хватит и этого решения
 * @returns случайное число от 0 до 17-значного
 */
function makeId() {
  const randomNumber = Math.random().toString().slice(2);
  return +randomNumber;
}

/* ============================ Типи, интерфейсы ============================ */

type ParamTypes = ["string", "number", "select"];
type ParamType = ParamTypes[number];

interface ParamValue {
  paramId: number,
  value: string,
}

interface Param {
  id: number,
  name: string,
  type: ParamTypes[number]
}

interface Model {
  paramValues: ParamValue[],
  // colors: Color[];
}

interface EditorParam extends Param {
  value: ParamValue["value"],
}

interface NewParamFormProps {
  addParam: (param: EditorParam) => void,
}

interface ParamListProps {
  items: EditorParam[],
  updateParam: (id: number, val: string) => void,
  deleteParam: (id: number) => void,
}

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  name: string,
  onChangeCb?: (val: string) => void,
}

export default App;
