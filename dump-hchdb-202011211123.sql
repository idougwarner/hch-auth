--
-- PostgreSQL database dump
--

-- Dumped from database version 12.4 (Debian 12.4-1.pgdg100+1)
-- Dumped by pg_dump version 12.1 (Ubuntu 12.1-1.pgdg19.04+1)

-- Started on 2020-11-21 11:23:18 EST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: dougwarner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO dougwarner;

--
-- TOC entry 2919 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: dougwarner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 203 (class 1259 OID 16387)
-- Name: users; Type: TABLE; Schema: public; Owner: dougwarner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying NOT NULL,
    email character varying NOT NULL,
    phone_number character varying,
    auth_hash character varying,
    email_verified boolean DEFAULT false,
    code character varying,
    new_email character varying,
    provider character varying DEFAULT 'email'::character varying NOT NULL,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO dougwarner;

--
-- TOC entry 202 (class 1259 OID 16385)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dougwarner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO dougwarner;

--
-- TOC entry 2920 (class 0 OID 0)
-- Dependencies: 202
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dougwarner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 2778 (class 2604 OID 16390)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dougwarner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 2913 (class 0 OID 16387)
-- Dependencies: 203
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dougwarner
--

COPY public.users (id, full_name, email, phone_number, auth_hash, email_verified, code, new_email, provider, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 2921 (class 0 OID 0)
-- Dependencies: 202
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dougwarner
--

SELECT pg_catalog.setval('public.users_id_seq', 115, true);


--
-- TOC entry 2783 (class 2606 OID 16401)
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: dougwarner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id);


--
-- TOC entry 2785 (class 2606 OID 16403)
-- Name: users users_un; Type: CONSTRAINT; Schema: public; Owner: dougwarner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_un UNIQUE (id);


-- Completed on 2020-11-21 11:23:18 EST

--
-- PostgreSQL database dump complete
--

